import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import io from 'socket.io-client';

const socket = io('http://192.168.43.27:5000');

export default function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on('receive-message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('update-users', (users) => {
      setUsers(users);
    });

    return () => {
      socket.off('receive-message');
      socket.off('update-users');
    };
  }, []);

  const handleLogin = () => {
    if (username.trim() !== '') {
      socket.emit('join', username);
      setIsLoggedIn(true);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      const newMessage = {
        username,
        message,
        timestamp: new Date().toLocaleTimeString(),
      };
      socket.emit('send-message', newMessage);
      setMessage('');
    }
  };

  // 🟡 Login screen
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Login to Chat</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={username}
          onChangeText={setUsername}
        />
        <Button title="Login" onPress={handleLogin} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{username}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.message}>
            <Text>
              <Text style={styles.UserName}>{item.username}{'\n'}</Text>
              <Text> {item.message}{' '}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </Text>
          </View>
        )}
      />
      <TextInput
        style={styles.input}
        placeholder="Type your message"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Send Message" onPress={handleSendMessage} />
      <View style={styles.explore}>
        <Text>Online Users:</Text>
        {users.map((user) => (
          <Text key={user.id}>{user.username}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 },
  message: { marginBottom: 7, backgroundColor:'seashell', width: 180, height: 45, borderRadius: 5, padding:4},
  timestamp: { fontSize: 9, color: 'gray'},
  explore: { marginTop: 20,},
  header: { fontSize: 18, marginBottom: 10, marginTop:30, backgroundColor: 'lightblue',  borderRadius: 4, height:30, textAlign:'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  UserName:{fontSize: 8}
});
