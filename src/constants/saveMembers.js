import { firestoreEvents } from "../firebase";
import { snapshotToArray } from "../utils";
import { firebase } from "../firebase/config";

export const saveMembers = async (lobby, users) => {
  if (!lobby.companyId) return;

  const promises = Object.values(users).map(async (user) => {
    const { nickname, email } = user;

    const membersRef = firestoreEvents.collection("companies").doc(lobby.companyId).collection("members");

    // Fetch users to verify.
    const usersQuery = await membersRef
      .where("searchName", "array-contains-any", [nickname?.toUpperCase(), email?.toUpperCase()])
      .get();
    const currentUsers = snapshotToArray(usersQuery);
    const currentUser = currentUsers[0];

    // Default properties.
    let newUser = {};
    const memberId = currentUser?.id ?? membersRef.doc().id;

    // Create member with format.
    if (!currentUser)
      newUser = {
        nickname: user.nickname ?? null,
        email: user.email ?? null,
        id: memberId,
        createAt: new Date(),
        updateAt: new Date(),
        deleted: false,
        status: "Active",
        role: "member",
        ads: [],
        searchName: [nickname?.toUpperCase(), email?.toUpperCase()],
      };

    // Update members.
    membersRef
      .doc(memberId)
      .set({ ...newUser, countPlays: firebase.firestore.FieldValue.increment(1) }, { merge: true });
  });

  await Promise.all(promises);
};
