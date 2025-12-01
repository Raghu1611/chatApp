import { useEffect, useState, useRef } from 'react';
import api from '../utils/apiClient';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Home() {
  const [me, setMe] = useState(null);
  const [chats, setChats] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [callState, setCallState] = useState('idle'); // idle, calling, incoming, connected
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnection = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const activeRef = useRef(null);
  const [lastSeenMap, setLastSeenMap] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile'); // 'profile', 'password'
  const [profileForm, setProfileForm] = useState({ name: '', bio: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);


  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function init() {
      try {
        const { data: meData } = await api.get('/users/me');
        setMe(meData);
        setProfileForm({ name: meData.name || '', bio: meData.bio || '' });
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
        const { data: chatsData } = await api.get('/chats');
        setChats(chatsData);
        const s = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
          auth: { token: localStorage.getItem('access_token') },
        });
        s.on('connect', () => { });
        s.on('online:users', (users) => {
          setOnlineUsers(new Set(users));
        });
        s.on('user:online', ({ userId }) => {
          setOnlineUsers(prev => new Set(prev).add(userId));
        });
        s.on('user:offline', ({ userId }) => {
          setOnlineUsers(prev => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        });

        s.on('message:new', ({ chatId, message }) => {
          if (active && chatId === active._id) {
            setMessages((prev) => [...prev, message]);
            if (document.visibilityState === 'visible') {
              s.emit('message:read', { messageId: message._id, chatId });
            } else {
              s.emit('message:delivered', { messageId: message._id, chatId });
            }
          } else {
            // If not active chat, still mark as delivered
            s.emit('message:delivered', { messageId: message._id, chatId });
          }
          setChats((prev) =>
            prev.map((c) => (c._id === chatId ? { ...c, lastMessage: message } : c))
          );
          if (document.hidden && Notification.permission === 'granted') {
            new Notification(`New message from ${message.sender.name}`, {
              body: message.type === 'text' ? message.content : 'Sent an attachment',
              icon: message.sender.avatarUrl
            });
          }
        });

        s.on('message:read', ({ messageId, userId, chatId }) => {
          if (active && chatId === active._id) {
            setMessages(prev => prev.map(m => {
              if (m._id === messageId && !m.readBy.includes(userId)) {
                return { ...m, readBy: [...m.readBy, userId] };
              }
              return m;
            }));
          }
        });

        s.on('message:delivered', ({ messageId, userId, chatId }) => {
          if (active && chatId === active._id) {
            setMessages(prev => prev.map(m => {
              if (m._id === messageId && !m.deliveredTo?.includes(userId)) {
                return { ...m, deliveredTo: [...(m.deliveredTo || []), userId] };
              }
              return m;
            }));
          }
        });

        // WebRTC Signaling Listeners
        s.on('call:incoming', ({ from, offer }) => {
          setIncomingCall({ from, offer });
          setCallState('incoming');
        });
        s.on('call:accepted', async ({ answer }) => {
          if (peerConnection.current) {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
            setCallState('connected');
          }
        });
        s.on('call:ice-candidate', async ({ candidate }) => {
          if (peerConnection.current) {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });
        s.on('call:ended', () => {
          endCall(false);
        });
        s.on('call:failed', ({ message }) => {
          alert(message);
          endCall(false);
        });

        s.on('typing:start', ({ userId, chatId }) => {
          if (activeRef.current && chatId === activeRef.current._id && userId !== meData._id) setTyping(true);
        });
        s.on('typing:stop', ({ userId, chatId }) => {
          if (activeRef.current && chatId === activeRef.current._id && userId !== meData._id) setTyping(false);
        });
        s.on('user:online', ({ userId }) => {
          setOnlineUsers(prev => new Set(prev).add(userId));
        });
        s.on('user:offline', ({ userId, lastSeen }) => {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
          if (lastSeen) {
            setLastSeenMap(prev => ({ ...prev, [userId]: lastSeen }));
          }
        });
        s.on('message:read', ({ messageId, chatId }) => {
          if (active && chatId === active._id) {
            setMessages(prev => prev.map(m => m._id === messageId ? { ...m, readBy: [...m.readBy, 'read'] } : m));
          }
        });
        s.on('message:react', ({ messageId, userId, emoji, chatId }) => {
          if (active && chatId === active._id) {
            setMessages(prev => prev.map(m => {
              if (m._id === messageId) {
                const reactions = m.reactions || [];
                const newReactions = reactions.filter(r => r.user !== userId).concat({ user: userId, emoji });
                return { ...m, reactions: newReactions };
              }
              return m;
            }));
          }
        });
        s.on('message:deleted', ({ messageId, chatId, deleteType }) => {
          const currentActive = activeRef.current;
          if (currentActive && chatId === currentActive._id) {
            if (deleteType === 'forMe') {
              // Remove message from local view only
              setMessages(prev => prev.filter(m => m._id !== messageId));
            } else if (deleteType === 'forEveryone') {
              // Mark as deleted for everyone
              setMessages(prev => prev.map(m => {
                if (m._id === messageId) {
                  return { ...m, isDeleted: true, content: 'This message was deleted', type: 'text', url: null, replyTo: null };
                }
                return m;
              }));
            }
          }
        });

        s.on('message:edited', ({ messageId, chatId, content, isEdited, editedAt }) => {
          const currentActive = activeRef.current;
          if (currentActive && chatId === currentActive._id) {
            setMessages(prev => prev.map(m => {
              if (m._id === messageId) {
                return { ...m, content, isEdited, editedAt };
              }
              return m;
            }));
          }
        });
        setSocket(s);
      } catch (e) {
        if (e?.response?.status === 401) navigate('/login');
      }
    }
    init();
  }, []);

  async function openChat(c) {
    setActive(c);
    setShowSearch(false);
    const { data } = await api.get(`/chats/${c._id}/messages`);
    setMessages(data);
    socket?.emit('chat:join', c._id);

    // Fetch latest user data for 1-on-1 chats to get lastSeen
    if (!c.isGroup) {
      const other = c.members.find(m => m._id !== me._id);
      if (other) {
        try {
          const { data: userData } = await api.get(`/users/${other._id}`);
          if (userData.lastSeen) {
            setLastSeenMap(prev => ({ ...prev, [other._id]: userData.lastSeen }));
          }
        } catch (e) {
          console.error("Failed to fetch user status", e);
        }
      }
    }

    // Mark unread messages as read
    data.forEach(m => {
      if (!m.readBy.includes(me?._id)) {
        socket?.emit('message:read', { messageId: m._id, chatId: c._id });
        api.patch(`/messages/${m._id}/read`);
      }
    });
  }

  function onChange(e) {
    setInput(e.target.value);
    if (socket && active) {
      socket.emit('typing:start', { chatId: active._id });
      clearTimeout(onChange._t);
      onChange._t = setTimeout(() => socket.emit('typing:stop', { chatId: active._id }), 500);
    }
  }

  function send() {
    if (!input.trim() || !active || !socket) return;

    if (editingMessage) {
      // Edit existing message
      socket.emit('message:edit', {
        messageId: editingMessage._id,
        chatId: active._id,
        content: input.trim()
      });
      setEditingMessage(null);
    } else {
      // Send new message
      socket.emit('message:send', {
        chatId: active._id,
        type: 'text',
        content: input.trim(),
        replyTo: replyTo?._id
      });
      setReplyTo(null);
    }
    setInput('');
  }

  function openDeleteModal(message) {
    setMessageToDelete(message);
    setShowDeleteModal(true);
  }

  function handleDelete(deleteType) {
    if (!socket || !active || !messageToDelete) return;
    socket.emit('message:delete', {
      messageId: messageToDelete._id,
      chatId: active._id,
      deleteType
    });
    setShowDeleteModal(false);
    setMessageToDelete(null);
  }

  function startEditMessage(message) {
    setEditingMessage(message);
    setInput(message.content);
    setReplyTo(null);
  }

  function canEdit(message) {
    if (!message || message.isDeleted || message.sender._id !== me?._id) return false;
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    return new Date(message.createdAt) > twoMinutesAgo;
  }

  function canDeleteForEveryone(message) {
    if (!message || message.sender._id !== me?._id) return false;
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    return new Date(message.createdAt) > twoMinutesAgo;
  }

  function reactToMessage(messageId, emoji) {
    socket.emit('message:react', { chatId: active._id, messageId, emoji });
  }

  async function viewUserProfile(userId) {
    try {
      const { data } = await api.get(`/users/${userId}`);
      setSelectedUserProfile(data);
      setShowProfileModal(true);
    } catch (e) {
      console.error('Failed to load user profile', e);
      alert('Failed to load user profile');
    }
  }

  async function blockUser(userId) {
    if (!confirm('Are you sure you want to block this user? You will no longer receive messages from them.')) return;

    try {
      await api.post(`/users/${userId}/block`);
      setSelectedUserProfile(prev => ({ ...prev, isBlocked: true }));
      alert('User blocked successfully');
    } catch (e) {
      console.error('Failed to block user', e);
      alert('Failed to block user');
    }
  }

  async function unblockUser(userId) {
    try {
      await api.delete(`/users/${userId}/block`);
      setSelectedUserProfile(prev => ({ ...prev, isBlocked: false }));
      alert('User unblocked successfully');
    } catch (e) {
      console.error('Failed to unblock user', e);
      alert('Failed to unblock user');
    }
  }

  async function updateProfile() {
    setUpdatingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', profileForm.name);

      await api.put('/users/me', formData);
      await api.patch('/users/me/bio', { bio: profileForm.bio });

      const { data: updatedMe } = await api.get('/users/me');
      setMe(updatedMe);
      setProfileForm({ name: updatedMe.name || '', bio: updatedMe.bio || '' });

      alert('Profile updated successfully!');
    } catch (e) {
      console.error('Failed to update profile', e);
      alert('Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  }

  async function changePassword() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setUpdatingProfile(true);
    try {
      await api.put('/users/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    } catch (e) {
      console.error('Failed to change password', e);
      alert(e.response?.data?.message || 'Failed to change password');
    } finally {
      setUpdatingProfile(false);
    }
  }

  function openSettings() {
    setShowSettingsModal(true);
    setSettingsTab('profile');
  }

  async function handleFileUpload(file) {
    if (!file || !active) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      socket.emit('message:send', { chatId: active._id, type, url: data.url, content: type === 'file' ? file.name : undefined });
    } catch (e) {
      console.error(e);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  }

  function handleImageUpload(e) {
    handleFileUpload(e.target.files[0]);
  }

  function onDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }

  // WebRTC Functions
  async function startCall() {
    if (!active || active.isGroup) return;
    const otherUserId = active.members.find(m => m._id !== me._id)._id;

    setCallState('calling');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      peerConnection.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('call:ice-candidate', { toUserId: otherUserId, candidate: event.candidate });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call:start', { toUserId: otherUserId, offer });
    } catch (e) {
      console.error(e);
      alert('Could not access camera/microphone');
      setCallState('idle');
    }
  }

  async function acceptCall() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      peerConnection.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('call:ice-candidate', { toUserId: incomingCall.from, candidate: event.candidate });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('call:answer', { toUserId: incomingCall.from, answer });
      setCallState('connected');
    } catch (e) {
      console.error(e);
      endCall();
    }
  }

  function endCall(emit = true) {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setCallState('idle');
    setIncomingCall(null);

    if (emit) {
      if (active && !active.isGroup) {
        const otherUserId = active.members.find(m => m._id !== me._id)._id;
        socket.emit('call:end', { toUserId: otherUserId });
      } else if (incomingCall) {
        socket.emit('call:end', { toUserId: incomingCall.from });
      }
    }
  }

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef(null);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'voice_message.webm', { type: 'audio/webm' });
        handleFileUpload(file);
        setRecording(false);
        clearInterval(recordingTimerRef.current);
        setRecordingDuration(0);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
    } catch (e) {
      console.error(e);
      alert('Microphone access denied');
    }
  }

  function stopRecording() {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  }

  function cancelRecording() {
    if (mediaRecorder) {
      // Stop the recorder but don't upload
      mediaRecorder.onstop = () => {
        setRecording(false);
        clearInterval(recordingTimerRef.current);
        setRecordingDuration(0);
        mediaRecorder.stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.stop();
    }
  }

  const formatDuration = (seconds) => {
    if (typeof seconds !== 'number') return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  async function acceptChat() {
    if (!active) return;
    try {
      // We can reuse the togglePin logic or just update the chat locally and on backend
      // Since we don't have a specific 'accept' endpoint, we'll assume sending a message or just updating the 'acceptedBy' array via a patch would work.
      // For now, let's simulate it by sending a system message or just updating local state if backend handles it on message send.
      // Ideally, we should have an endpoint. Let's assume we added one or we use a workaround.
      // Workaround: Just send a "Chat accepted" system message or similar, OR we implement the endpoint.
      // Let's implement a simple endpoint call if we had it, but for now we'll rely on the user sending a message to accept, 
      // OR we can add a specific action.
      // Let's add a specific API call to update the chat.
      await api.patch(`/chats/${active._id}/accept`); // We need to add this route to backend
      setChats(prev => prev.map(c => c._id === active._id ? { ...c, acceptedBy: [...(c.acceptedBy || []), me._id] } : c));
      setActive(prev => ({ ...prev, acceptedBy: [...(prev.acceptedBy || []), me._id] }));
    } catch (e) { console.error(e); }
  }

  async function blockChat() {
    if (!active) return;
    try {
      await api.patch(`/chats/${active._id}/block`);
      setChats(prev => prev.map(c => c._id === active._id ? { ...c, blockedBy: [...(c.blockedBy || []), me._id] } : c));
      setActive(prev => ({ ...prev, blockedBy: [...(prev.blockedBy || []), me._id] }));
      // Optionally clear active chat or show blocked state
    } catch (e) { console.error(e); }
  }

  function getMessageStatus(m) {
    if (m.sender._id !== me?._id) return null;
    const isRead = m.readBy.length > 1; // Assuming group or 1-on-1, length > 1 means someone else read it
    const isDelivered = m.deliveredTo?.length > 1;

    if (isRead) return <span className="text-blue-500">✓✓</span>;
    if (isDelivered) return <span className="text-gray-500">✓✓</span>;
    return <span className="text-gray-400">✓</span>;
  }

  async function searchUsers() {
    if (!searchQuery.trim()) return;
    const { data } = await api.get(`/users/search?q=${searchQuery}`);
    setSearchResults(data);
  }

  async function startChat(user) {
    const { data } = await api.post('/chats', { userId: user._id });
    setChats((prev) => [data, ...prev.filter((c) => c._id !== data._id)]);
    openChat(data);
  }

  async function togglePin(e, chat) {
    e.stopPropagation();
    try {
      const { data } = await api.patch(`/chats/${chat._id}/pin`);
      setChats(prev => {
        const updated = prev.map(c => c._id === chat._id ? { ...c, pinnedBy: data.pinnedBy } : c);
        return updated.sort((a, b) => {
          const aPinned = a.pinnedBy?.includes(me._id);
          const bPinned = b.pinnedBy?.includes(me._id);
          if (aPinned === bPinned) {
            const dateA = new Date(a.lastMessage?.createdAt || a.updatedAt || a.createdAt);
            const dateB = new Date(b.lastMessage?.createdAt || b.updatedAt || b.createdAt);
            return dateB - dateA;
          }
          return aPinned ? -1 : 1;
        });
      });
    } catch (e) { console.error(e); }
  }

  function logout() {
    localStorage.clear();
    navigate('/login');
  }

  const [onlyAdminsCanSend, setOnlyAdminsCanSend] = useState(false);

  async function createGroup() {
    if (!groupName || groupMembers.length === 0) return;
    setCreatingGroup(true);
    try {
      const formData = new FormData();
      formData.append('name', groupName);
      formData.append('members', JSON.stringify(groupMembers.map(u => u._id)));
      formData.append('onlyAdminsCanSend', onlyAdminsCanSend);
      if (groupAvatar) {
        formData.append('avatar', groupAvatar);
      }

      const { data } = await api.post('/chats/group', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setChats(prev => [data, ...prev]);
      setShowGroupModal(false);
      setGroupName('');
      setGroupMembers([]);
      setGroupAvatar(null);
      openChat(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingGroup(false);
    }
  }

  const handleGroupAvatarChange = (e) => {
    if (e.target.files[0]) {
      setGroupAvatar(e.target.files[0]);
    }
  };

  const toggleGroupMember = (user) => {
    if (groupMembers.find(m => m._id === user._id)) {
      setGroupMembers(prev => prev.filter(m => m._id !== user._id));
    } else {
      setGroupMembers(prev => [...prev, user]);
    }
  };

  function formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function formatLastSeen(date) {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday ? `Last seen today at ${formatTime(d)}` : `Last seen ${d.toLocaleDateString()} at ${formatTime(d)}`;
  }

  function getChatName(chat) {
    if (chat.isGroup) return chat.name;
    const other = chat.members?.find((m) => m._id !== me?._id);
    return other?.name || 'Unknown';
  }

  function getChatAvatar(chat) {
    if (chat.isGroup) {
      if (chat.avatarUrl) return <img src={chat.avatarUrl} alt={chat.name} className="w-full h-full object-cover rounded-full" />;
      return chat.name?.[0]?.toUpperCase() || 'G';
    }
    const other = chat.members?.find((m) => m._id !== me?._id);
    if (other?.avatarUrl) return <img src={other.avatarUrl} alt={other.name} className="w-full h-full object-cover rounded-full" />;
    return other?.name?.[0]?.toUpperCase() || '?';
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-500">
      {/* Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-all duration-300 ${active ? 'hidden md:flex' : 'flex'}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold overflow-hidden cursor-pointer hover:opacity-90 transition"
              onClick={openSettings}
              title="Settings"
            >
              {me?.avatarUrl ? (
                <img src={me.avatarUrl} alt={me.name} className="w-full h-full object-cover" />
              ) : (
                me?.name?.[0]?.toUpperCase()
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Chats</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
            <button
              onClick={() => setShowGroupModal(true)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition"
              title="Create Group"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button onClick={logout} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
        {showSearch && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              />
              <button
                onClick={searchUsers}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
              >
                Search
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => startChat(u)}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3 border-b border-gray-100 dark:border-slate-700 last:border-0"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {u.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-800 dark:text-white">{u.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {
            chats.map((c) => (
              <div
                key={c._id}
                onClick={() => openChat(c)}
                className={`p-3 flex items-center gap-3 cursor-pointer border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition group ${active?._id === c._id ? 'bg-gray-50 dark:bg-slate-700' : ''
                  } ${c.pinnedBy?.includes(me?._id) ? 'bg-gray-50/50 dark:bg-slate-800/50' : ''}`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                  {getChatAvatar(c)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-800 dark:text-white truncate flex items-center gap-1">
                      {getChatName(c)}
                      {c.pinnedBy?.includes(me?._id) && (
                        <svg className="w-3 h-3 text-gray-400 transform rotate-45" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      )}
                    </h3>
                    {c.lastMessage && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTime(c.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    {c.lastMessage ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
                        {c.lastMessage.sender?.name === me?.name ? 'You: ' : ''}
                        {c.lastMessage.content}
                      </p>
                    ) : <p className="text-sm text-gray-400 italic">No messages</p>}

                    <button
                      onClick={(e) => togglePin(e, c)}
                      className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition ${c.pinnedBy?.includes(me?._id) ? 'text-green-500 opacity-100' : 'text-gray-400'}`}
                      title={c.pinnedBy?.includes(me?._id) ? "Unpin Chat" : "Pin Chat"}
                    >
                      <svg className="w-4 h-4 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          {chats.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p className="mb-2">No chats yet</p>
              <p className="text-sm">Search for users to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className="flex-1 flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-500 relative"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {isDragging && active && (
          <div className="absolute inset-0 bg-green-500/10 z-50 flex items-center justify-center border-4 border-green-500 border-dashed m-4 rounded-2xl backdrop-blur-sm">
            <div className="text-center">
              <svg className="w-16 h-16 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <h3 className="text-2xl font-bold text-green-700">Drop files to send</h3>
            </div>
          </div>
        )}
        {active ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-100 dark:bg-slate-800 p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 transition-colors duration-500">
              <div
                className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden cursor-pointer hover:opacity-80 transition"
                onClick={() => !active.isGroup && viewUserProfile(active.members?.find(m => m._id !== me?._id)?._id)}
              >
                {getChatAvatar(active)}
              </div>
              <div
                className="flex-1 cursor-pointer hover:opacity-80 transition"
                onClick={() => !active.isGroup && viewUserProfile(active.members?.find(m => m._id !== me?._id)?._id)}
              >
                <h2 className="font-semibold text-gray-800 dark:text-white">{getChatName(active)}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {typing ? 'typing...' : active.isGroup
                    ? `${active.members?.length} members`
                    : onlineUsers.has(active.members?.find(m => m._id !== me?._id)?._id)
                      ? 'Online'
                      : formatLastSeen(lastSeenMap[active.members?.find(m => m._id !== me?._id)?._id]) || 'Offline'}
                </p>
              </div>
              {!active.isGroup && (
                <>
                  <button
                    onClick={() => viewUserProfile(active.members?.find(m => m._id !== me?._id)?._id)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition text-gray-600 dark:text-gray-300"
                    title="View Profile"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </button>
                  <button onClick={startCall} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition text-gray-600 dark:text-gray-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h100v100H0z" fill="%23f0f0f0"/%3E%3C/svg%3E")', backgroundSize: '400px' }}>
              {messages.map((m) => {
                const isMe = m.sender._id === me?._id;
                return (
                  <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg relative`}>
                      {!isMe && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-2">{m.sender.name}</div>
                      )}
                      <div
                        className={`px-4 py-2 rounded-lg shadow-sm ${isMe
                          ? 'bg-green-500 text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white rounded-bl-none'
                          } ${m.isDeleted ? 'italic opacity-70' : ''}`}
                      >
                        {m.replyTo && !m.isDeleted && (
                          <div className={`text-xs mb-1 p-1 rounded border-l-2 ${isMe ? 'bg-green-600 border-green-200 text-green-100' : 'bg-gray-100 dark:bg-slate-600 border-green-500 text-gray-500 dark:text-gray-300'}`}>
                            <p className="font-bold">{m.replyTo.sender?.name}</p>
                            <p className="truncate">{m.replyTo.content || 'Attachment'}</p>
                          </div>
                        )}
                        {m.type === 'image' && !m.isDeleted ? (
                          <img src={m.url} alt="Shared image" className="max-w-full rounded-lg mb-1 cursor-pointer hover:opacity-90 transition" onClick={() => window.open(m.url, '_blank')} />
                        ) : m.type === 'file' && !m.isDeleted ? (
                          <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-slate-600 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-500 transition" onClick={() => window.open(m.url, '_blank')}>
                            <svg className="w-8 h-8 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium truncate">{m.content || 'Attachment'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Click to download</p>
                            </div>
                          </div>
                        ) : m.type === 'audio' && !m.isDeleted ? (
                          <div className="flex items-center gap-2 min-w-[200px]">
                            <audio controls src={m.url} className="w-full h-8" />
                          </div>
                        ) : (
                          <p className="text-sm break-words">{m.content}</p>
                        )}
                        <div
                          className={`text-xs mt-1 ${isMe ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                            } text-right flex items-center justify-end gap-1`}
                        >
                          {formatTime(m.createdAt)}
                          {m.isEdited && <span className="italic text-[10px]">(edited)</span>}
                          {isMe && (
                            <span className="text-[10px] font-bold ml-1">
                              {getMessageStatus(m)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Message Actions (Hover) */}
                      {!m.isDeleted && (
                        <div className={`absolute top-0 ${isMe ? '-left-20' : '-right-20'} hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-800 shadow-md rounded-lg p-1`}>
                          <button onClick={() => setReplyTo(m)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-500 dark:text-gray-400" title="Reply">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                          </button>
                          {isMe && canEdit(m) && (
                            <button onClick={() => startEditMessage(m)} className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded text-blue-500" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                          )}
                          {isMe && (
                            <button onClick={() => openDeleteModal(m)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-red-500" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Reactions Display */}
                      {m.reactions && m.reactions.length > 0 && (
                        <div className={`absolute -bottom-3 ${isMe ? 'left-0' : 'right-0'} bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5`}>
                          {Array.from(new Set(m.reactions.map(r => r.emoji))).slice(0, 3).map((emoji, i) => (
                            <span key={i} className="text-xs">{emoji}</span>
                          ))}
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{m.reactions.length}</span>
                        </div>
                      )}

                      {/* Reaction Picker */}
                      <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-24' : '-right-24'} opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 shadow-lg rounded-full p-1 flex items-center gap-1 border border-gray-100 dark:border-slate-700`}>
                        {['❤️', '👍', '😂', '😮', '😢'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => reactToMessage(m._id, emoji)}
                            className="w-7 h-7 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full flex items-center justify-center text-lg transition"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Request / Input */}
            {active && !active.isGroup && !active.acceptedBy?.includes(me?._id) && active.members?.find(m => m._id !== me?._id) ? (
              <div className="bg-gray-100 dark:bg-slate-800 p-4 border-t border-gray-200 dark:border-slate-700 text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-3">Do you want to accept messages from this user?</p>
                <div className="flex justify-center gap-4">
                  <button onClick={acceptChat} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">Accept</button>
                  <button onClick={blockChat} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Block</button>
                </div>
              </div>
            ) : active?.blockedBy?.includes(me?._id) ? (
              <div className="bg-gray-100 dark:bg-slate-800 p-4 border-t border-gray-200 dark:border-slate-700 text-center">
                <p className="text-red-500 font-medium">You have blocked this user.</p>
                <button onClick={() => { /* Implement unblock if needed */ }} className="text-sm text-gray-500 underline mt-2">Unblock (Not implemented yet)</button>
              </div>
            ) : active?.isGroup && active?.onlyAdminsCanSend && !active?.admins?.includes(me?._id) ? (
              <div className="bg-gray-100 dark:bg-slate-800 p-4 border-t border-gray-200 dark:border-slate-700 text-center">
                <p className="text-gray-500 dark:text-gray-400 font-medium">Only admins can send messages in this group.</p>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-slate-800 p-4 border-t border-gray-200 dark:border-slate-700 transition-colors duration-500">
                {recording ? (
                  <div className="flex items-center gap-4 animate-fadeIn">
                    <button onClick={cancelRecording} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    <div className="flex-1 flex items-center gap-3 bg-white dark:bg-slate-700 px-4 py-3 rounded-full border border-red-200 dark:border-red-900/50">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-500 font-medium animate-pulse">Recording...</span>
                      <span className="text-gray-500 dark:text-gray-300 font-mono ml-auto">{formatDuration(recordingDuration)}</span>
                    </div>
                    <button onClick={stopRecording} className="w-12 h-12 bg-green-500 text-white rounded-full hover:bg-green-600 transition flex items-center justify-center shadow-lg shadow-green-500/30 animate-bounce">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition disabled:opacity-50"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

                    {editingMessage && (
                      <div className="flex items-center justify-between bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mb-2 border-l-4 border-blue-500">
                        <div className="text-sm">
                          <p className="font-bold text-blue-600 dark:text-blue-400">Editing message</p>
                          <p className="text-gray-600 dark:text-gray-300 truncate">{editingMessage.content}</p>
                        </div>
                        <button onClick={() => { setEditingMessage(null); setInput(''); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    )}

                    <input
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Type a message"
                      value={input}
                      onChange={onChange}
                      onKeyPress={(e) => e.key === 'Enter' && send()}
                    />

                    {input.trim() ? (
                      <button
                        onClick={send}
                        className="w-12 h-12 bg-green-500 text-white rounded-full hover:bg-green-600 transition flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={startRecording}
                        className="w-12 h-12 bg-blue-500 text-white rounded-full hover:opacity-90 transition flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 transition-colors duration-500">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Welcome to Chat</h2>
              <p className="text-gray-500 dark:text-gray-400">Select a chat to start messaging</p>
            </div>
          </div>
        )
        }
      </div >

      {/* Group Modal */}
      {
        showGroupModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn">
              <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Group</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center cursor-pointer hover:opacity-80 transition overflow-hidden border-2 border-dashed border-gray-300 dark:border-slate-600"
                  >
                    {groupAvatar ? (
                      <img src={URL.createObjectURL(groupAvatar)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleGroupAvatarChange} className="hidden" accept="image/*" />
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Group Name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Add Members</label>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); searchUsers(); }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-100 dark:border-slate-700 rounded-lg p-2">
                    {searchResults.map(u => (
                      <div
                        key={u._id}
                        onClick={() => toggleGroupMember(u)}
                        className={`p-2 rounded-lg flex items-center gap-3 cursor-pointer transition ${groupMembers.find(m => m._id === u._id) ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden">
                          {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" /> : u.name[0]}
                        </div>
                        <span className="text-sm text-gray-800 dark:text-white flex-1">{u.name}</span>
                        {groupMembers.find(m => m._id === u._id) && (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    ))}
                    {searchResults.length === 0 && <p className="text-xs text-gray-500 text-center py-2">Search to add members</p>}
                  </div>
                </div>

                {groupMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {groupMembers.map(m => (
                      <span key={m._id} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                        {m.name}
                        <button onClick={() => toggleGroupMember(m)} className="hover:text-red-500">&times;</button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="onlyAdmins"
                    checked={onlyAdminsCanSend}
                    onChange={(e) => setOnlyAdminsCanSend(e.target.checked)}
                    className="w-4 h-4 text-green-500 rounded border-gray-300 focus:ring-green-500"
                  />
                  <label htmlFor="onlyAdmins" className="text-sm text-gray-700 dark:text-gray-300 select-none">
                    Only admins can send messages
                  </label>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createGroup}
                  disabled={!groupName || groupMembers.length === 0 || creatingGroup}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creatingGroup ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Delete Modal */}
      {showDeleteModal && messageToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scaleIn">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Message</h3>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => handleDelete('forMe')}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <p className="font-medium text-gray-900 dark:text-white">Delete for Me</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">This message will be removed from your view only</p>
              </button>
              <button
                onClick={() => handleDelete('forEveryone')}
                disabled={!canDeleteForEveryone(messageToDelete)}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="font-medium text-gray-900 dark:text-white">Delete for Everyone</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {canDeleteForEveryone(messageToDelete)
                    ? 'This message will be removed for all participants'
                    : 'Only available within 2 minutes of sending'}
                </p>
              </button>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => { setShowDeleteModal(false); setMessageToDelete(null); }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfileModal && selectedUserProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn">
            {/* Profile Header */}
            <div className="relative h-32 bg-gradient-to-br from-purple-400 to-pink-500">
              <button
                onClick={() => { setShowProfileModal(false); setSelectedUserProfile(null); }}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Profile Avatar */}
            <div className="relative px-6 -mt-16">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-4xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                {selectedUserProfile.avatarUrl ? (
                  <img src={selectedUserProfile.avatarUrl} alt={selectedUserProfile.name} className="w-full h-full object-cover" />
                ) : (
                  selectedUserProfile.name?.[0]?.toUpperCase()
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedUserProfile.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{selectedUserProfile.email}</p>

              {selectedUserProfile.bio && (
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{selectedUserProfile.bio}"</p>
                </div>
              )}

              <div className="space-y-3 text-left">
                {selectedUserProfile.lastSeen && (
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatLastSeen(selectedUserProfile.lastSeen) || 'Last seen recently'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex gap-3">
              <button
                onClick={() => { setShowProfileModal(false); setSelectedUserProfile(null); }}
                className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                Close
              </button>
              {selectedUserProfile.isBlocked ? (
                <button
                  onClick={() => unblockUser(selectedUserProfile._id)}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Unblock User
                </button>
              ) : (
                <button
                  onClick={() => blockUser(selectedUserProfile._id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                  Block User
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleIn">
            {/* Settings Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setSettingsTab('profile')}
                className={`flex-1 px-6 py-3 font-medium transition ${settingsTab === 'profile'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
              >
                Profile
              </button>
              <button
                onClick={() => setSettingsTab('password')}
                className={`flex-1 px-6 py-3 font-medium transition ${settingsTab === 'password'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
              >
                Password
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {settingsTab === 'profile' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                      placeholder="Tell us about yourself..."
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {profileForm.bio.length}/200 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={me?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <button
                    onClick={updateProfile}
                    disabled={updatingProfile}
                    className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {updatingProfile ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    onClick={changePassword}
                    disabled={updatingProfile || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {updatingProfile ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
