import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Login() {
  return (
    <View style={styles.container}>
      <View style={styles.flex1}>
        <View>
            <Pressable style={styles.engener}>
                <Text style={styles.engenerText}>инженер</Text>
            </Pressable>
        </View>
      <Text style={styles.text}>Мое первое приложение!</Text>
      </View>
      <View style={styles.flex2}>
      <Text style={styles.subText}>React Native работает! 🎉</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  engenerText:{
    textAlign: 'center',
    alignItems: 'center',
    color: 'white',
  },
  engener: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'red',
    borderRadius: 10,
  },
  flex1: {flex: 1,
    backgroundColor: 'lightblue',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
   flex2: {flex: 1,
    backgroundColor: 'lightblue',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: 'gray',
  },
});