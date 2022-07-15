import React, { useState, useEffect } from "react";
import Button from "./Button";
import { db, auth, provider, storage } from "../firebase";
import AttachFileIcon from "@mui/icons-material/AttachFile";

export default function CommentSection({ id }) {
  const [comment, setComment] = useState("");
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  useEffect(() => {
    const userUid = localStorage.getItem("uid")
      ? localStorage.getItem("uid")
      : null;
    setUid(userUid);
    if (uid) {
      db.collection("users")
        .doc(uid)
        .onSnapshot((doc) => {
          setUser(doc.data());
        });
    }
  }, [uid]);
  return (
    <div>
      {user?.displayName ? (
        <>
          <div>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a comment..."
              className="commentInput"
            />
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "12px",
            }}
          >
            <button
              onClick={() => {
                if (!comment) return;
                db.collection("posts")
                  .doc(id)
                  .get()
                  .then((doc) => {
                    let comments = doc.data().comments;
                    comments.push({
                      comment,
                      name: user.displayName,
                    });
                    console.log(comments);
                    db.collection("posts")
                      .doc(id)
                      .update({
                        comments: comments,
                      })
                      .then(() => {
                        setComment("");
                      });
                  });
              }}
              style={{ width: "130px" }}
              className="postBtn"
            >
              Post comment
            </button>
            <button className="wjhe">See full post</button>
          </div>
        </>
      ) : (
        <p>Sign in to comment</p>
      )}
    </div>
  );
}
