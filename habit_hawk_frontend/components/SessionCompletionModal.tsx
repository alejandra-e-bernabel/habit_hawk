import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface SessionCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating?: number, note?: string) => void;
  habitName: string;
}

const SessionCompletionModal: React.FC<SessionCompletionModalProps> = ({
  visible,
  onClose,
  onSubmit,
  habitName,
}) => {
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    onSubmit(rating, note.trim() || undefined);
    // Reset state
    setRating(undefined);
    setNote("");
    onClose();
  };

  const handleSkip = () => {
    onSubmit(undefined, undefined);
    // Reset state
    setRating(undefined);
    setNote("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="checkmark-outline" size={48} color={Colors.white} />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Session Complete!</Text>
            <Text style={styles.subtitle}>Great job completing {habitName}</Text>

            {/* Rating Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How did it go?</Text>
              <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={rating && rating >= star ? "star" : "star-outline"}
                      size={40}
                      color={rating && rating >= star ? Colors.warning : Colors.textMuted}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add a note (optional)</Text>
              <TextInput
                style={styles.noteInput}
                multiline
                numberOfLines={4}
                placeholder="How are you feeling? What did you learn?"
                placeholderTextColor={Colors.textTertiary}
                value={note}
                onChangeText={setNote}
                maxLength={2000}
              />
              <Text style={styles.charCount}>{note.length}/2000</Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Save & Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    textAlignVertical: "top",
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: "right",
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  skipButtonText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: "500",
  },
});

export default SessionCompletionModal;
