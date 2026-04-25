# Security Specification for Nexus Social

## Data Invariants
1. A user can only edit their own profile.
2. A user can only create a post as themselves (authorId must match auth.uid).
3. A user can only delete their own posts.
4. A user can only like a post once (enforced by userId as doc ID in subcollection).
5. A user can only follow another user if they are themselves (followerId must match auth.uid).
6. Notifications are only readable by the recipient.
7. Post likes/comments counts should ideally be updated via Cloud Functions or atomic transactions (here I'll use client-side with security rules allowing exactly +1).

## The Dirty Dozen (Attack Payloads)
1. **Identity Spoofing (Create Post)**: Trying to create a post with `authorId: 'other_user_id'`.
2. **Shadow Field Injection (Update User)**: Trying to update user profile with `{ isAdmin: true }`.
3. **Privilege Escalation (Delete Post)**: Trying to delete a post with `postId` belonging to another user.
4. **Relationship Poisoning (Follow)**: Trying to follow a user on behalf of someone else (`followerId: 'victim_id'`).
5. **PII Leak (User List)**: Trying to list all users' emails.
6. **Denial of Wallet (ID Poisoning)**: Creating a post with a 1MB string as a document ID.
7. **Resource Poisoning (Bio size)**: Setting a bio string that is 10MB.
8. **Unauthorized Read (Notifications)**: Trying to read notifications for `recipientId: 'other_user'`.
9. **State Shortcutting (Like)**: Directly updating a post's `likesCount` by +100 without actually liking it.
10. **Shadow Update (Comment)**: Adding a `verified: true` field to a comment.
11. **Spoof Attack (Email)**: Authenticating with an unverified email that matches an admin email (if I had admins).
12. **Query Trust Attack**: Trying to query posts without the `where('authorId', '==', auth.uid)` filter (if specifically restricted).

## Test Runner (Conceptual)
All the above payloads will be tested against the generated `firestore.rules`.
