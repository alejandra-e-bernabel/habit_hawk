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
import AvatarIcon from "@/components/AvatarIcon";
import Toast, { ToastType } from "@/components/Toast";
import useGetFriends from "@/hooks/social/useGetFriends";
import useGetPendingRequests from "@/hooks/social/useGetPendingRequests";
import useSendFriendRequest from "@/hooks/social/useSendFriendRequest";
import useAcceptFriendRequest from "@/hooks/social/useAcceptFriendRequest";
import useRemoveFriend from "@/hooks/social/useRemoveFriend";

type Tab = "friends" | "pending" | "add";

export default function Friends() {
  const [selectedTab, setSelectedTab] = useState<Tab>("friends");
  const [friendUsername, setFriendUsername] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");

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
  const { removeFriend, loading: removingFriend } = useRemoveFriend();

  const [refreshing, setRefreshing] = useState(false);

  // Helper to get display name
  const getDisplayName = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim();
    }
    return username || '';
  };

  // Helper to show toast
  const showToast = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Filter friends based on search query
  const filteredFriends = friends.filter((friend) => {
    const displayName = getDisplayName(friend.first_name, friend.last_name, friend.username).toLowerCase();
    return displayName.includes(searchQuery.toLowerCase());
  });

  // Filter pending requests based on search query
  const filteredPendingRequests = pendingRequests.filter((request) => {
    const username = request.requester.username.toLowerCase();
    return username.includes(searchQuery.toLowerCase());
  });

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
      showToast("Please enter a username", "error");
      return;
    }

    try {
      await sendRequest(friendUsername.trim());
      showToast(`Friend request sent to ${friendUsername}`, "success");
      setFriendUsername("");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to send friend request",
        "error"
      );
    }
  };

  const handleAcceptRequest = async (friendshipId: number, username: string) => {
    try {
      await acceptRequest(friendshipId);
      showToast(`You are now friends with ${username}!`, "success");
      refetchPending();
      refetchFriends();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to accept friend request",
        "error"
      );
    }
  };

  const handleRejectRequest = async (friendshipId: number, username: string) => {
    const confirmReject = () => {
      removeFriend(friendshipId)
        .then(() => {
          showToast(`Friend request from ${username} rejected`, "success");
          refetchPending();
        })
        .catch((err) => {
          showToast(
            err instanceof Error ? err.message : "Failed to reject request",
            "error"
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
      removeFriend(friendshipId)
        .then(() => {
          showToast(`${username} removed from friends`, "success");
          refetchFriends();
        })
        .catch((err) => {
          showToast(
            err instanceof Error ? err.message : "Failed to remove friend",
            "error"
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

    if (filteredFriends.length === 0 && searchQuery.trim()) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Results</Text>
          <Text style={styles.emptyText}>
            No friends match "{searchQuery}"
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
        {filteredFriends.map((friend) => (
          <View key={friend.friendship_id} style={styles.friendItem}>
            <AvatarIcon
              firstName={friend.first_name}
              lastName={friend.last_name}
              username={friend.username}
              profileIconName={friend.profile_icon_name}
              profileImageUrl={friend.profile_image_url}
              size={48}
              borderColor={Colors.primary}
              borderWidth={0}
            />
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>
                {getDisplayName(friend.first_name, friend.last_name, friend.username)}
              </Text>
              <Text style={styles.friendSince}>
                Friends since {new Date(friend.since).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleRemoveFriend(friend.friendship_id, getDisplayName(friend.first_name, friend.last_name, friend.username))}
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

    if (filteredPendingRequests.length === 0 && searchQuery.trim()) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Results</Text>
          <Text style={styles.emptyText}>
            No pending requests match "{searchQuery}"
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
        {filteredPendingRequests.map((request) => (
          <View key={request.friendship_id} style={styles.requestItem}>
            <AvatarIcon
              username={request.requester.username}
              size={48}
              borderColor={Colors.primary}
              borderWidth={0}
            />
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
          headerShown: false,
        }}
      />
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Friends</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close-outline" size={28} color={Colors.primary} />
            </TouchableOpacity>
          </View>
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
            onChange={(tab) => {
              setSelectedTab(tab);
              setSearchQuery("");
            }}
          />
          {(selectedTab === "friends" || selectedTab === "pending") && (
            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={20}
                color={Colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${selectedTab === "friends" ? "friends" : "requests"}...`}
                placeholderTextColor={Colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          )}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    marginTop: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
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
