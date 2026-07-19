import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
  RefreshControl,
} from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import SegmentedControl from "@/components/SegmentedControl";
import useGetFriends from "@/hooks/social/useGetFriends";
import useGetPendingRequests from "@/hooks/social/useGetPendingRequests";
import useSendFriendRequest from "@/hooks/social/useSendFriendRequest";
import useAcceptFriendRequest from "@/hooks/social/useAcceptFriendRequest";
import useRemoveFriend from "@/hooks/social/useRemoveFriend";

type Tab = "friends" | "pending" | "add";

export default function Friends() {
  const [selectedTab, setSelectedTab] = useState<Tab>("friends");
  const [friendUsername, setFriendUsername] = useState("");

  // Hooks
  const {
    friends,
    loading: friendsLoading,
    error: friendsError,
    refetch: refetchFriends,
  } = useGetFriends();
  const {
    pendingRequests,
    loading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
  } = useGetPendingRequests();
  const { sendRequest, loading: sendingRequest } = useSendFriendRequest();
  const { acceptRequest, loading: acceptingRequest } = useAcceptFriendRequest();
  const { remove, loading: removingFriend } = useRemoveFriend();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedTab === "friends") {
      await refetchFriends();
    } else if (selectedTab === "pending") {
      await refetchPending();
    }
    setRefreshing(false);
  };

  const handleSendRequest = async () => {
    if (!friendUsername.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    try {
      await sendRequest(friendUsername.trim());
      Alert.alert("Success", `Friend request sent to ${friendUsername}`);
      setFriendUsername("");
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to send friend request"
      );
    }
  };

  const handleAcceptRequest = async (friendshipId: number, username: string) => {
    try {
      await acceptRequest(friendshipId);
      Alert.alert("Success", `You are now friends with ${username}!`);
      refetchPending();
      refetchFriends();
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to accept friend request"
      );
    }
  };

  const handleRejectRequest = async (friendshipId: number, username: string) => {
    const confirmReject = () => {
      remove(friendshipId)
        .then(() => {
          Alert.alert("Success", `Friend request from ${username} rejected`);
          refetchPending();
        })
        .catch((err) => {
          Alert.alert(
            "Error",
            err instanceof Error ? err.message : "Failed to reject request"
          );
        });
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Reject friend request from ${username}?`)) {
        confirmReject();
      }
    } else {
      Alert.alert(
        "Reject Request",
        `Are you sure you want to reject the friend request from ${username}?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Reject", style: "destructive", onPress: confirmReject },
        ]
      );
    }
  };

  const handleRemoveFriend = async (friendshipId: number, username: string) => {
    const confirmRemove = () => {
      remove(friendshipId)
        .then(() => {
          Alert.alert("Success", `${username} removed from friends`);
          refetchFriends();
        })
        .catch((err) => {
          Alert.alert(
            "Error",
            err instanceof Error ? err.message : "Failed to remove friend"
          );
        });
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Remove ${username} from your friends?`)) {
        confirmRemove();
      }
    } else {
      Alert.alert(
        "Remove Friend",
        `Are you sure you want to remove ${username} from your friends?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", style: "destructive", onPress: confirmRemove },
        ]
      );
    }
  };

  const renderFriendsTab = () => {
    if (friendsLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }

    if (friendsError) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
          <Text style={styles.errorText}>{friendsError}</Text>
        </View>
      );
    }

    if (friends.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="people-outline" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Friends Yet</Text>
          <Text style={styles.emptyText}>
            Add friends to compete on the leaderboard!
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {friends.map((friend) => (
          <View key={friend.friendship_id} style={styles.friendItem}>
            <View style={styles.friendAvatar}>
              <Text style={styles.friendAvatarText}>
                {friend.username.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.username}</Text>
              <Text style={styles.friendSince}>
                Friends since {new Date(friend.since).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleRemoveFriend(friend.friendship_id, friend.username)}
              disabled={removingFriend}
              style={styles.removeButton}
            >
              <Ionicons name="person-remove-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderPendingTab = () => {
    if (pendingLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }

    if (pendingError) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
          <Text style={styles.errorText}>{pendingError}</Text>
        </View>
      );
    }

    if (pendingRequests.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="mail-outline" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Pending Requests</Text>
          <Text style={styles.emptyText}>
            You're all caught up!
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {pendingRequests.map((request) => (
          <View key={request.friendship_id} style={styles.requestItem}>
            <View style={styles.friendAvatar}>
              <Text style={styles.friendAvatarText}>
                {request.requester.username.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.requestInfo}>
              <Text style={styles.requestName}>{request.requester.username}</Text>
              <Text style={styles.requestDate}>
                {new Date(request.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.requestActions}>
              <TouchableOpacity
                onPress={() =>
                  handleAcceptRequest(request.friendship_id, request.requester.username)
                }
                disabled={acceptingRequest}
                style={styles.acceptButton}
              >
                <Ionicons name="checkmark" size={20} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  handleRejectRequest(request.friendship_id, request.requester.username)
                }
                disabled={removingFriend}
                style={styles.rejectButton}
              >
                <Ionicons name="close" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderAddTab = () => {
    return (
      <View style={styles.addContainer}>
        <View style={styles.addContent}>
          <Ionicons name="person-add-outline" size={64} color={Colors.primary} />
          <Text style={styles.addTitle}>Add a Friend</Text>
          <Text style={styles.addDescription}>
            Enter your friend's username to send them a friend request
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color={Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              placeholderTextColor={Colors.textTertiary}
              value={friendUsername}
              onChangeText={setFriendUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              sendingRequest && styles.sendButtonDisabled,
            ]}
            onPress={handleSendRequest}
            disabled={sendingRequest || !friendUsername.trim()}
          >
            {sendingRequest ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Ionicons name="send" size={20} color={Colors.white} />
                <Text style={styles.sendButtonText}>Send Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Friends",
          presentation: "modal",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close-outline" size={28} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <SegmentedControl
            options={[
              { label: "Friends", value: "friends" as Tab },
              {
                label: `Pending${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ""}`,
                value: "pending" as Tab,
              },
              { label: "Add Friend", value: "add" as Tab },
            ]}
            value={selectedTab}
            onChange={setSelectedTab}
          />
        </View>

        {selectedTab === "friends" && renderFriendsTab()}
        {selectedTab === "pending" && renderPendingTab()}
        {selectedTab === "add" && renderAddTab()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginTop: 16,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  // Friends Tab
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLightest,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  friendSince: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  removeButton: {
    padding: 8,
  },
  // Pending Tab
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    backgroundColor: Colors.success,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: Colors.error,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  // Add Tab
  addContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  addContent: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  addTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  addDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 14,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
