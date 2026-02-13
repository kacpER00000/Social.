import {Post, PostResponse, PostResultObj} from "./types/types.ts";
import PostItem from "./PostItem.tsx";
import {useLoaderData} from "react-router-dom";
import {useEffect, useRef, useState} from "react";

const Home = () =>{
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
                const data = await response.json()
                setPosts(prev => [...prev, ...data.content])
                console.log(page.current)
                console.log(data.content)
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
        return () => {
            if (sentinelRef.current) {
                observer.unobserve(sentinelRef.current);
            }
        };
    }, []);

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
        }
        setSelectedPost(null)
    }

    return (
        <>
            {selectedPost &&
                <SinglePostPage
                    post={selectedPost}
                    onClose={closePost}
                />
            }
            <div className="flex flex-col w-full">
                {posts.map((item, idx) =>
                    <PostItem post={item} key={idx} onSelect={showPostComponent}/>
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