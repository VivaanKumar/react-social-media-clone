import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { db, storage } from "../firebase";
import { ToastContainer, toast } from "react-toastify";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(0);
  const [desc, setDesc] = useState("Loading...");
  const [name, setName] = useState("Loading...");
  const [photoUrl, setPhotoUrl] = useState("Loading...");
  const userUid = localStorage.getItem("uid")
    ? localStorage.getItem("uid")
    : null;
  if (userUid) {
  } else {
    window.location.href = "/";
  }

  useEffect(() => {
    db.collection("users")
      .doc(userUid)
      .onSnapshot((doc) => {
        setUser(doc.data());
        setDesc(doc.data().description);
        setPhotoUrl(doc.data().photoURL);
        setName(doc.data().displayName);
      });
  }, []);

  return (
    <div className="profile">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <nav className="navbar">
        <p>Disarray</p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={() => (window.location.href = "/profile")}
            className="signInBtn"
            style={{
              marginRight: "8px",
              height: "35px",
              fontSize: "13px",
              textAlign: "center",
              lineHeight: "0px",
              cursor: "not-allowed",
              backgroundColor: "lightgrey",
              pointerEvents: "none",
            }}
          >
            Profile
          </button>
          <img src={user?.photoURL} className="profilePicture" />
        </div>
      </nav>
      <div className="profileAlign">
        <div className="profileDiv">
          <div
            style={{
              width: "100%",
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "column",
            }}
          >
            <h1>Hey {user?.displayName}!</h1>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                className="fakeText"
                onClick={() => document.getElementById("changeId").click()}
                style={{
                  borderRadius: "8px",
                  cursor: "pointer",
                  height: "50px",
                  width: "50px",
                }}
                src={user?.photoURL}
              />
              <input
                onChange={(e) => {
                  if (e.target.files[0]) {
                    const image = e.target.files[0];
                    const randomId = uuidv4();
                    const uploadTask = storage
                      .ref(`profiles/${randomId}-${image.name}`)
                      .put(image);
                    uploadTask.on(
                      "state_changed",
                      (snapshot) => {
                        const progress = Math.round(
                          (snapshot.bytesTransferred / snapshot.totalBytes) *
                            100
                        );
                        setProgress(progress);
                      },
                      (error) => {
                        alert(error);
                      },
                      () => {
                        storage
                          .ref("profiles")
                          .child(`${randomId}-${image.name}`)
                          .getDownloadURL()
                          .then((imageUrl) => {
                            db.collection("users").doc(userUid).update({
                              photoURL: imageUrl,
                            });
                            setProgress(0);
                            db.collection("posts")
                              .where("diplayName", "==", user.displayName)
                              .onSnapshot((querySnapshot) => {
                                querySnapshot.forEach((doc) => {
                                  const id = doc.id;
                                  db.collection("posts")
                                    .doc(id)
                                    .update({
                                      photoURL: imageUrl,
                                    })
                                    .then(() => {
                                      console.log("DONE");
                                    });
                                });
                              });
                          });
                      }
                    );
                  }
                }}
                style={{ display: "none" }}
                type="file"
                id="changeId"
              />
              <button
                style={{ marginLeft: "8px" }}
                onClick={() => {
                  const input = prompt(
                    "Enter your new username! (It will be showed when you make a new post)"
                  );
                  const userAtm = user.displayName;
                  db.collection("users")
                    .doc(userUid)
                    .update({
                      displayName: input,
                    })
                    .then(() => {
                      console.log(user.displayName);
                      db.collection("posts")
                        .where("diplayName", "==", userAtm)
                        .onSnapshot((querySnapshot) => {
                          querySnapshot.forEach((doc) => {
                            const id = doc.id;
                            db.collection("posts")
                              .doc(id)
                              .update({
                                diplayName: input,
                              })
                              .then(() => {
                                console.log("DONE");
                              });
                          });
                        });
                    });
                }}
                className="signInBtn"
              >
                <a style={{ cursor: "pointer" }}>
                  {name !== "Loading..." ? "Change your name" : "Loading..."}
                </a>
              </button>
            </div>
            <p>Editing your profile...</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log(desc);
              db.collection("users")
                .doc(userUid)
                .update({
                  description: desc,
                })
                .then(() => {
                  toast.info("Description Updated", {
                    position: "bottom-left",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                });
            }}
          >
            <textarea
              onChange={(e) => setDesc(e.target.value)}
              value={desc}
              className="wowy"
              placeholder="Your description..."
            ></textarea>
            <button
              style={{
                border: "none",
                padding: "8px 8px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Update description
            </button>
          </form>
          <button
            style={{ marginTop: "8px" }}
            onClick={() => (window.location.href = "/")}
            className="signInBtn"
          >
            Go back
          </button>
          {progress !== 0 ? (
            <progress
              value={progress}
              max="100"
              title={progress + "%"}
            ></progress>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
