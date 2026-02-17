import {Post, PostResponse, PostResultObj} from "../types/types.ts";
import PostItem from "./PostItem.tsx";
import {useLoaderData} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {useFollowSystem} from "../contexts/FollowerContext.tsx";
import {formatDate} from "../utils/formatDate.ts";
import PostModal from "./Post.tsx";

const Home = () =>{
    const { addFollowedUsers } = useFollowSystem();
    const postResponse = useLoaderData() as PostResponse;
    const [posts, setPosts] = useState(postResponse.content)
    const [selectedPost, setSelectedPost] = useState<Post | null>(null)
    const sentinelRef = useRef(null)
    const loading = useRef(false)
    const page = useRef(1)
    const hasMorePages = useRef(postResponse.totalPages > 0)

    const fetchMorePosts = async () => {
        if(loading.current || !hasMorePages.current){return}
        loading.current = true
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/social/posts/latest?page=${page.current}`,{
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
            if(response.ok){
                const data = await response.json() as PostResponse
                setPosts(prev => [...prev, ...data.content])
                const followedIds = getFollowedIds(data.content)
                const uniqueFollowedIds = Array.from(new Set(followedIds))
                console.log(uniqueFollowedIds)
                if(uniqueFollowedIds.length > 0){
                    addFollowedUsers(uniqueFollowedIds)
                }
                page.current += 1
                hasMorePages.current = postResponse.totalPages > page.current
            }
        } catch (e){
            console.log("Error: " + e)
        } finally {
            loading.current = false
        }
    }

    useEffect(() => {
        setPosts(prev =>
            prev.map(post => ({...post, createdAt: formatDate(post.createdAt)}))
        )
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                fetchMorePosts()
            }
        }, {
            root: null,
            rootMargin: "0px",
            threshold: 1.0,
        });
        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }
        addFollowedUsers(getFollowedIds(posts))
        return () => {
            if (sentinelRef.current) {
                observer.unobserve(sentinelRef.current);
            }
        };
    }, []);

    const getFollowedIds = (posts: Post[]) => {
        return posts
            .filter(post => post.isAuthorFollowed)
            .map(post => post.authorId)
    }

    const showPostComponent = (post: Post) => {
        setSelectedPost(post)
    }

    const closePost = (postResultObj: PostResultObj | null) => {
        if(postResultObj !== null){
            if(postResultObj.status === "DELETED"){
                setPosts(prev => prev.filter(post => post.postId !== postResultObj.post.postId))
            }
            if(postResultObj.status === "UPDATED"){
                setPosts(prev =>
                    prev.map(post =>
                        post.postId === postResultObj.post.postId ?
                            {...postResultObj.post}
                            : post
                    )
                )
            }
            if(postResultObj.status === "FOLLOWED"){
                setPosts(prev =>
                    prev.map(post =>
                        post.authorId === postResultObj.post.authorId ?
                            {...post, isAuthorFollowed: postResultObj.post.isAuthorFollowed}
                            : post
                    )
                )
            }
        }
        setSelectedPost(null)
    }

    return (
        <>
            {selectedPost &&
                <PostModal
                    post={selectedPost}
                    onClose={closePost}
                />
            }
            <div className="flex flex-col w-full">
                {posts.map((item) =>
                    <PostItem post={item} key={item.postId} onSelect={showPostComponent}/>
                )}
            </div>
            {loading.current &&
                <div className="border rounded-3xl p-5 m-5">
                    <div className="flex animate-pulse space-x-4">
                        <div className="flex-1 space-y-6 py-1">
                            <div className="h-2 rounded bg-gray-200"></div>
                            <div className="h-2 rounded bg-gray-200"></div>
                            <div className="h-2 rounded bg-gray-200"></div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-1 h-2 rounded bg-gray-200"></div>
                                    <div className="col-span-1 h-2 rounded bg-gray-200"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            <div ref={sentinelRef}></div>
        </>
    )
}

export default Home;