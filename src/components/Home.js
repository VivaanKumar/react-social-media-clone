import React, { useState, useEffect } from 'react'
import Button from './Button';
import { db, auth, provider, storage } from "../firebase";
import { v4 as uuidv4 } from 'uuid';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function Home() {
  const [uid, setUid] = useState(null);
  const [user, setUser] = useState(null);
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [posts, setPosts] = useState(null);
  useEffect(() => {
    // this is where the code runs
    db.collection("posts").onSnapshot((snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, post: doc.data() })));
    });
  }, []);
  const addPost = () => {
    if(image && caption) {
      const randomId = uuidv4();
      const uploadTask = storage.ref(`images/${randomId}-${image.name}`).put(image);
      uploadTask.on("state_changed", (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred/snapshot.totalBytes) * 100);
        setProgress(progress);
      }, (error) => {alert(error)}, () => {
        storage.ref("images").child(`${randomId}-${image.name}`)
        .getDownloadURL()
        .then((imageUrl) => {
          db
          .collection("posts")
          .doc(uuidv4())
          .set({
            caption,
            diplayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            likes: [],
            comments: [],
            imageUrl,
            imageType: image.type
          })
          setCaption("");
          setImage(null);
          const imagePreview = document.getElementById("image-preview");
          const videoPreview = document.getElementById("video-preview");
          videoPreview.style.display = "none"
          imagePreview.style.display = "none"
          setProgress(0);
        })
      })
    } else if(caption){
      db
      .collection("posts")
      .doc(uuidv4())
      .set({
        caption,
        diplayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        likes: [],
        comments: [],
      })
      setCaption("");
      setImage(null);
      const imagePreview = document.getElementById("image-preview");
      const videoPreview = document.getElementById("video-preview");
      videoPreview.style.display = "none"
      imagePreview.style.display = "none"
      setProgress(0);
    }
  }
  const handleChange = (e) => {
    if(e.target.files[0]) {
      const selectedImageSrc = URL.createObjectURL(e.target.files[0]);
      console.log(e.target.files[0]);
      const type = e.target.files[0].type;
      if(type.includes("image")) {
        const imagePreview = document.getElementById("image-preview");
        const videoPreview = document.getElementById("video-preview");
        videoPreview.style.display = "none"
        imagePreview.src = selectedImageSrc;
        imagePreview.style.display = "block";
        setImage(e.target.files[0]);
      }
      else if(type.includes("video")) {
        const imagePreview = document.getElementById("image-preview");
        const videoPreview = document.getElementById("video-preview");
        imagePreview.style.display = "none"
        videoPreview.src = selectedImageSrc;
        videoPreview.style.display = "block";
        setImage(e.target.files[0]);
      } else {
        alert("This file type is not supported :(")
      }
    }
  }
  const signIn = async () => {
    console.log("Signing in with google...");
    auth
    .signInWithPopup(provider)
    .then(async(result) => {
      console.log(result);
      const uid = result.user.uid;
      const displayName = result.user.displayName;
      const email = result.user.email;
      const photoURL = result.user.photoURL;
      const lastSeen = new Date();
      localStorage.setItem("uid", uid)
      await db
      .collection("users")
      .doc(uid)
      .get()
      .then(async(doc) => {
        if(doc.exists) {
          await db
          .collection("users")
          .doc(uid)
          .update({
            lastSeen: new Date(),
          })
        } else {
          await db
          .collection("users")
          .doc(uid)
          .set({
            displayName,
            email,
            photoURL,
            lastSeen,
          })
        }
      })
      setUid(uid);
    });
  }
  useEffect(() => {
    const userUid = localStorage.getItem("uid") ? localStorage.getItem("uid") : null;
    setUid(userUid)
    if(uid) {
      db
      .collection("users")
      .doc(uid)
      .onSnapshot((doc) => {
        setUser(doc.data())
      })
    }
  }, [uid]);
  const fakePosts = [];
  for (let i = 0; i < 5; i++) {
    fakePosts.push(
      <div className="post">
        <div className="topInfo">
          <img src={undefined} className="postPhotoUrl"/>
          <p className="fakeText"></p>
        </div>
        <p style={{width: "40vw", marginTop: "16px"}} className="fakeText"></p>
        <p style={{width: "40vw", marginTop: "8px"}}className="fakeText"></p>
        <p style={{width: "35vw", marginTop: "8px"}} className="fakeText"></p>
      </div>
    )
  }
  return (
    <div className="home">
      <ToastContainer />
      <nav className="navbar">
        <p>Disarraygi</p>
        {user ? (
          <img src={user?.photoURL} className="profilePicture"/>
        ) : <Button signIn={signIn}/>}
      </nav>
      {user && (
        <fieldset className="createPost">
          <legend style={{fontSize: "20px"}}>Create Post</legend>
          <textarea
            value={caption}
            placeholder="Your message..."
            onChange={(e) => setCaption(e.target.value)}
          ></textarea>
          <div className="postCaps" style={{marginTop : "12px"}}>
            <label title="Import an existing image or video" style={{cursor: "pointer"}} htmlFor="file-upload" className="custom-file-upload">
              <p style={{display: "flex", alignItems: "center", fontSize: "14px"}}>{image ? "Change" : "Upload"} <AttachFileIcon fontSize="small"/></p>
            </label>
            <button onClick={addPost} className="postBtn">Post</button>
          </div>
          <video controls id="video-preview"></video>
          <img id="image-preview"/>
          <input onChange={handleChange} style={{display: "none"}} id="file-upload" type="file"/>
          {progress !== 0 ? <progress value={progress} max="100" title={progress+"%"}></progress> : <></>}
        </fieldset>
      )}
      

      {/*SKELETON POST*/}
      {posts?.map(({ id, post }) => (
        <div className="post">
          <div className="topInfo">
            <img style={{}} src={post?.photoURL} className="postPhotoUrl"/>
            {user.email !== post.email ? <p>{post?.email}</p> : <button style={{display: "flex", alignItems: "center"}} className='postBtn' onClick={() => {
              const request = window.confirm("Do you want to delete this post?");
              if(request) {
                db
                .collection("posts")
                .doc(id)
                .delete()

              }
            }}>Delete <DeleteIcon style={{color: "darkgrey"}}/></button>}
          </div>
          {post?.imageUrl ? (
            <>
            {post?.imageType.includes("image") && (
              <img style={{margin: "8px 0px", borderRadius: "8px", width: "100%", height: "400px"}} src={post.imageUrl}/>
            )}
            {post?.imageType.includes("video") && (
              <video controls style={{border: "1px solid rgba(230,230,230)", margin: "8px 0px", borderRadius: "8px", width: "100%", height: "400px"}} src={post.imageUrl}></video>
            )}
            </>
          ) : <></>} 
          <div style={{marginTop: "6px"}}className="bottomInfo">
            <strong>{post?.caption}</strong>
            <p onClick={() => {
              db
              .collection("posts")
              .doc(id)
              .get()
              .then((doc) => {
                let heartings = doc.data().likes;
                if(heartings.includes(user.email)) {
                  let newHeartings = heartings.filter(e => e !== user.email);
                  db.collection("posts").doc(id).update({
                    likes: newHeartings
                  })
                } else {
                  heartings.push(user.email)
                  db.collection("posts").doc(id).update({
                    likes: heartings
                  })
                }
              })
            }}style={{display: "flex", alignContent: "center"}}><FavoriteIcon style={{color: post.likes.includes(user.email) ? "firebrick" : "lightgrey", marginRight: "4px", cursor: "pointer"}}/> {post?.likes.length}</p>
          </div>
        </div>
      ))}
      {!posts && fakePosts}
    </div>
  )
}
