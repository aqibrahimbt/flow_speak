import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle } from "lucide-react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <AlertCircle size={64} color="#FF4A8B" strokeWidth={2} />
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.subtitle}>The page you are looking for does not exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#1a1a1a",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  link: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#FF4A8B",
    borderRadius: 12,
  },
  linkText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#fff",
  },
});
