import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";  // Import only doc and setDoc
import { db } from "../firebase/firebaseConfig";  // Import Firebase config

const UserProfile: React.FC = () => {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

  useEffect(() => {
    const createUserInFirestore = async () => {
      if (isAuthenticated && user) {
        const userRef = doc(db, "users", user.sub);  // Using Auth0 user ID as Firestore doc ID
        const userData = {
          email: user.email,
          name: user.name,
          picture: user.picture,
          createdAt: new Date(),
        };

        try {
          await setDoc(userRef, userData, { merge: true });
          console.log("User data saved to Firestore!");
        } catch (error) {
          console.error("Error saving user data to Firestore: ", error);
        }
      }
    };

    if (!isLoading && isAuthenticated && user) {
      createUserInFirestore();
    }
  }, [user, isAuthenticated, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <button onClick={() => loginWithRedirect()}>Log In</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Welcome, {user.name}!</h2>
      <img src={user.picture} alt={user.name} />
      <button onClick={() => logout({ returnTo: window.location.origin })}>Log Out</button>
    </div>
  );
};

export default UserProfile;
