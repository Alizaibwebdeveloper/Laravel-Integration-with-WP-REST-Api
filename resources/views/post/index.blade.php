<x-app-layout>
    <x-slot name="header">
        <div class="flex justify-between items-center">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {{ __('Post') }}
            </h2>
    
    
    <button id="addPostBtn" class="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded">
        Add Post
    </button>
        </div>

    </x-slot>


    <style>

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.loading-spinner {
    border: 8px solid #f3f3f3;
    border-top: 8px solid #3498db;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}
.hide_element{
    display: none;
}

.loading-text {
    font-size: 20px;
    color: #333;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

</style>

    <!-- Loading overlay HTML -->
<div class="page-loader loading-overlay hide_element">
    <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Processing, please wait...</p>
    </div>
</div>


<div class="container mx-auto p-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="posts-list">
        
    </div>
</div>

<!-- Add Post Modal -->
<div id="addPostModal" class="fixed inset-0 bg-black bg-opacity-50 hidden justify-center items-center transition-opacity duration-300 ease-out opacity-0">
    <!-- Modal -->
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md transform scale-90 transition-transform duration-300 ease-out opacity-0">
        <!-- Modal Header -->
        <div class="flex justify-between items-center bg-gray-100 px-4 py-2 border-b">
            <h3 class="text-xl font-semibold">Create Post</h3>
            <button id="closeModalBtn" class="text-gray-600 hover:text-gray-800">&times;</button>
        </div>

        <!-- Modal Body: Form -->
        <div class="p-6">
            <form id="addPostForm">
                <div class="mb-4">
                    <label for="postTitle" class="block text-gray-700 font-semibold">Title</label>
                    <input type="text" id="postTitle" name="postTitle" class="w-full mt-2 p-2 border rounded-md" required>
                </div>

                <div class="mb-4">
                    <label for="postContent" class="block text-gray-700 font-semibold">Content</label>
                    <textarea id="postContent" name="postContent" rows="4" class="w-full mt-2 p-2 border rounded-md"></textarea>
                </div>

                <div class="mb-4">
                    <label for="uploadImage" class="block text-gray-700 font-semibold">Upload File</label>
                    <input type="file" id="uploadImage" name="uploadImage" class="w-full mt-2 p-2 border rounded-md">
                </div>

                <div class="mb-4">
                    <label for="postCategory" class="block text-gray-700 font-semibold">Category</label>
                    <select id="postCategory" name="postCategory" class="w-full mt-2 p-2 border rounded-md" required> 
                        <option value="1">Category 1</option>
                    </select>
                </div>

                <div class="mb-4">
                    <label for="postStatus" class="block text-gray-700 font-semibold">Status</label>
                    <select id="postStatus" name="postStatus" class="w-full mt-2 p-2 border rounded-md" required>
                        <option value="draft">Draft</option>
                        <option value="publish">Published</option>
                    </select>
                </div>

                <div class="flex justify-end">
                    <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">Submit</button>
                </div>
            </form>
        </div>
    </div>
</div>


<!-- Edit Post Modal -->
<div id="editPostModal" class="fixed inset-0 bg-black bg-opacity-50 hidden justify-center items-center transition-opacity duration-300 ease-out opacity-0">
    <!-- Modal -->
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl transform scale-90 transition-transform duration-300 ease-out opacity-0">
        <!-- Modal Header -->
        <div class="flex justify-between items-center bg-gray-100 px-4 py-2 border-b">
            <h3 class="text-xl font-semibold">Update Post</h3>
            <button id="closeModalEditBtn" class="text-gray-600 hover:text-gray-800">&times;</button>
        </div>

        <!-- Modal Body: Form -->
        <div class="p-6">
            <form id="editPostForm">
                <input type="hidden" name="editPostId" id="editPostId">
                <input type="hidden" name="editFeaturedMediaId" id="editFeaturedMediaId">
                <div class="grid grid-cols-2 gap-4">
                    <div class="mb-4">
                        <label for="editPostTitle" class="block text-gray-700 font-semibold">Title</label>
                        <input type="text" id="editPostTitle" name="editPostTitle" class="w-full mt-2 p-2 border rounded-md" required>
                    </div>

                    <div class="mb-4">
                        <label for="editPostCategory" class="block text-gray-700 font-semibold">Category</label>
                        <select id="editPostCategory" name="editPostCategory" class="w-full mt-2 p-2 border rounded-md" required>
                            <option value="1">Category 1</option>
                        </select>
                    </div>

                    <div class="mb-4">
                        <label for="editPostImage" class="block text-gray-700 font-semibold">Upload File</label>
                        <input type="file" id="editPostImage" name="editPostImage" class="w-full mt-2 p-2 border rounded-md">
                        <img src="" id="editPostImageUrl" class="mt-2" style="height: 100px; width: 100px;" alt="Preview">
                    </div>

                    <div class="mb-4">
                        <label for="editPostStatus" class="block text-gray-700 font-semibold">Status</label>
                        <select id="editPostStatus" name="editPostStatus" class="w-full mt-2 p-2 border rounded-md" required>
                            <option value="draft">Draft</option>
                            <option value="publish">Published</option>
                        </select>
                    </div>
                </div>

                <div class="mb-4">
                    <label for="editPostContent" class="block text-gray-700 font-semibold">Content</label>
                    <textarea id="editPostContent" name="editPostContent" rows="6" class="w-full mt-2 p-2 border rounded-md"></textarea>
                </div>

                <div class="flex justify-end">
                    <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">Submit</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.ckeditor.com/ckeditor5/39.0.1/classic/ckeditor.js"></script>
<script src="{{asset('script.js')}}"></script>
</x-app-layout>
