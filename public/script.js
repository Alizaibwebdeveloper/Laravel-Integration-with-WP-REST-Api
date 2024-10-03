$(document).ready(function () {

    // Add CK editors to Text-area

    // Add post Contetnt

    ClassicEditor.create(document.querySelector('#postContent')).then((editor) => {
        window.addPostEditor = editor;
    }).catch((error) => {

        console.log(error);
    });

    // Edit post ck editor content

    ClassicEditor.create(document.querySelector('#editPostContent')).then((editor) => {
        window.updatePostEditor = editor;
    }).catch((error) => {

        console.log(error);
    });

    // Open Modal
    $("#addPostBtn").click(function () {
        $("#addPostModal").removeClass("hidden").addClass("flex");
        setTimeout(function () {
            $("#addPostModal").removeClass("opacity-0");
            $("#addPostModal .transform").removeClass("scale-90 opacity-0");
        }, 70);
    });

    // Close Modal
    $("#closeModalBtn").click(function () {
        $("#addPostModal").removeClass("flex").addClass("hidden");
        setTimeout(function () {
            $("#addPostModal").addClass("opacity-0");
            $("#addPostModal .transform").addClass("scale-90 opacity-0");
        }, 70);
    });

    // Open Edit Modal
    $(document).on("click", ".btn-edit-post", function () {
        $("#editPostModal").removeClass("hidden").addClass("flex");
        setTimeout(function () {
            $("#editPostModal").removeClass("opacity-0");
            $("#editPostModal .transform").removeClass("scale-90 opacity-0");
        }, 70);
    });

    // Close Edit Modal
    $(document).on("click", "#closeModalEditBtn", function () {
        $("#editPostModal").removeClass("flex").addClass("hidden");
        setTimeout(function () {
            $("#editPostModal").addClass("opacity-0");
            $("#editPostModal .transform").addClass("scale-90 opacity-0");
        }, 70);
    });

    // Fetch posts
    fetchPosts();

    // Open post view
    $(document).on("click", ".btn-open-post-view", function () {
        let PostUrl = $(this).data("url");
        window.open(PostUrl, "_blank");
    });

    // Call the function to fetch categories
    fetchAllCategories();

    // Submit Add post form

    $('#addPostForm').on("submit", function (event) {
        event.preventDefault();

        $(".page-loader").removeClass("hide_element");


        // Prepare the post data
        let postData = {
            "title": $("#postTitle").val(),
            "content": addPostEditor.getData(),
            "status": $("#postStatus").val(),
            "categories": [parseInt($("#postCategory").val())],
            "featured_media": 0
        };

        // Fetch the image file
        let featureImageFile = $("#uploadImage")[0].files[0];

        if (featureImageFile) {
            // Image upload to WordPress Media
            let formData = new FormData();
            formData.append("file", featureImageFile);
            formData.append("title", $("#postTitle").val()); // Optional: Image title
            formData.append("alt_text", "Post featured image"); // Optional: Alt text
            formData.append("status", "publish");


            $.ajax({
                url: "http://localhost/headless-App/wp_app/wp-json/wp/v2/media",
                data: formData,
                processData: false, // Prevent jQuery from processing the data
                contentType: false,  // Let the browser set the Content-Type, including boundary
                method: "POST",
                dataType: "json",
                headers: {
                    'Authorization': 'Basic ' + btoa('Alizaib:b*T8fFoit)dvIhslyC') // Replace with your username and application password
                },
                success: function (response) {
                    // On success, set the media ID in the postData
                    let mediaId = response.id;

                    postData.featured_media = mediaId;
                    createWpPost(postData);

                    // Now create the post with the media ID
                },
                error: function (error) {
                    console.log("Error uploading media:", error);
                }
            });

        } else {
            createWpPost(postData);
        }

    });

    // Read Single post

    $(document).on("click", ".btn-edit-post", function () {
        let postID = $(this).attr("data-id");

        // Add Loader
        $(".page-loader").removeClass("hide_element");

        getSinglePostData(postID, function (response) {
            // Populate post fields in the modal
            $("#editPostTitle").val(response.title.rendered);
            let categoryId = response.categories.length > 0 ? response.categories[0] : null;
            $("#editPostCategory").val(categoryId);

            updatePostEditor.setData(response.content.rendered);

            $("#editPostStatus").val(response.status);
            $("#editPostId").val(response.id);

            // Fetch and display featured media if available
            let mediaID = response.featured_media > 0 ? response.featured_media : null;
            if (mediaID) {
                // Fetch the media URL
                fetchMediaUrl(mediaID, function (mediaAPIResponse) {
                    let mediaURL = mediaAPIResponse.source_url;
                    $("#editPostImageUrl").attr("src", mediaURL);
                    $(".page-loader").addClass("hide_element");
                });
            } else {
                // Set default image if no featured media
                $("#editPostImageUrl").attr("src", "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png");
                $(".page-loader").addClass("hide_element");
            }
        });
    });


    // Submit Edit form

    $("#editPostForm").on("submit", function (event) {

        event.preventDefault();

        let postID = $("#editPostId").val();

        let postDataobj = {


            "title": $("#editPostTitle").val(),
            "content": updatePostEditor.getData(),
            "categories": [parseInt($("#editPostCategory").val())],
            "status": $("#editPostStatus").val(),
            "featured_media": 0
        };

        let editpostImageFileObject = $("#editPostImage")[0].files[0];
        if (editpostImageFileObject) {

            let formData = new FormData(); // Correct capitalization for FormData

            formData.append("file", editpostImageFileObject);


            $.ajax({
                url: "http://localhost/headless-App/wp_app/wp-json/wp/v2/media",
                data: formData,
                processData: false, // Prevent jQuery from processing the data
                contentType: false,  // Let the browser set the Content-Type, including boundary
                method: "POST",
                dataType: "json",
                headers: {
                    'Authorization': 'Basic ' + btoa('Alizaib:b*T8fFoit)dvIhslyC') // Replace with your username and application password
                },
                success: function (response) {
                    // On success, set the media ID in the postData
                    let mediaId = response.id;

                    postDataobj.featured_media = mediaId;
                    updateWPPost(postID, postDataobj);

                    // Now create the post with the media ID
                },
                error: function (error) {
                    console.log("Error uploading media:", error);
                }
            });
        } else {

            // Exisiting Id value
            updateWPPost(postID, postDataobj);

            postDataobj.featured_media = $("#editFeaturedMediaId");

        }
    })

    // Delete Button Event

    $(document).on("click", ".btn-delete-post", function () {
        let postID = $(this).data("id");
        if (confirm("Are You sure want to delete?")) {
            // Ok Button clicked!


            deleteWPPost(postID, function (response) {

                if (response) {

                    location.reload();

                } else {
                    alert(response);
                }
            });
        }
    })

});




// Function for  Fetch Post
const fetchPosts = () => {
    $(".page-loader").removeClass("hide_element");

    $.ajax({
        url: "http://localhost/headless-App/wp_app/wp-json/wp/v2/posts?status=draft,publish", // Fetch drafts and published posts
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('Alizaib:b*T8fFoit)dvIhslyC') // Replace with your username and application password
        },
        success: function (response) {
            let $listpostParentID = $("#posts-list");
            $listpostParentID.empty(); // Clear previous posts

            response.forEach((post) => {
                let categoryId = post.categories.length > 0 ? post.categories[0] : null;
                let mediaID = post.featured_media;

                // Default media URL
                let defaultMedia = "https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png";
                let mediaURL = defaultMedia; // Set default media URL
                let DraftspanTag = '';

                // Fetch media URL if mediaID is valid
                if (mediaID !== 0) {
                    fetchMediaUrl(mediaID, function (mediaAPIResponse) {
                        let mediaURL = mediaAPIResponse.source_url;

                        // Fetch category title
                        if (categoryId) {
                            fetchCategoryTitle(categoryId, function (categoryAPIResponse) {
                                let categoryName = categoryAPIResponse.name;
                                appendPostToList(post, DraftspanTag, categoryName, mediaURL, $listpostParentID);
                            });
                        } else {
                            let categoryName = "Uncategorized";
                            appendPostToList(post, DraftspanTag, categoryName, mediaURL, $listpostParentID);
                        }
                    });
                } else {
                    // Handle case where mediaID is 0
                    if (categoryId) {
                        fetchCategoryTitle(categoryId, function (categoryAPIResponse) {
                            let categoryName = categoryAPIResponse.name;
                            appendPostToList(post, DraftspanTag, categoryName, mediaURL, $listpostParentID);
                        });
                    } else {
                        let categoryName = "Uncategorized";
                        appendPostToList(post, DraftspanTag, categoryName, mediaURL, $listpostParentID);
                    }
                }
            });

            $(".page-loader").addClass("hide_element");
        },
        error: function (error) {
            console.log("Error fetching posts:", error);
        }
    });
};


// Fetch category title
const fetchCategoryTitle = (categoryId, callback) => {
    $.ajax({
        url: `http://localhost/headless-App/wp_app/wp-json/wp/v2/categories/${categoryId}`,
        method: "GET",
        dataType: "json",
        headers: {
            'Content-Type': 'application/json',
        },
        success: function (response) {
            callback(response);
        },
        error: function (error) {
            console.log("Error fetching category:", error);
        }
    });
};

// Fetch media URL
const fetchMediaUrl = (mediaID, callback) => {
    $.ajax({
        url: `http://localhost/headless-App/wp_app/wp-json/wp/v2/media/${mediaID}`,
        method: "GET",
        dataType: "json",
        headers: {
            'Content-Type': 'application/json',
        },
        success: function (response) {
            callback(response);
        },
        error: function (error) {
            console.log("Error fetching media:", error);
        }
    });
};

// Append post to the list
const appendPostToList = (post, DraftspanTag, categoryName, mediaURL, $listpostParentID) => {
    // Determine post status for DraftspanTag

    let publishModeView = "";
    if (post.status === "draft") {
        DraftspanTag = '<span class="bg-red-500 text-white py-1" style="padding: 5px; width: 44px; text-align: center; display: inline-block;">Draft</span>';


    } else if (post.status === "publish") {
        DraftspanTag = '<span class="bg-green-500 text-white py-1" style="padding: 5px; width: 44px; text-align: center; display: inline-block;">Live</span>';

        publishModeView = `<button class="bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded btn-open-post-view" data-url="${post.link}">Post View</button>`;
    }

    // Generate the post template
    let postTemplate = `
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
            ${DraftspanTag}
            <img src="${mediaURL}" alt="#" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="text-xl font-semibold mb-2">${post.title.rendered}</h3>
                <p class="text-gray-600 text-sm">${post.content.rendered}</p>
                <span class="text-sm text-blue-500 font-semibold">${categoryName}</span> <br/>
                <span class="text-sm text-blue-500 font-semibold">${post.status}</span>
                <div class="mt-4 flex space-x-2">
                    <button class="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded btn-edit-post" data-id="${post.id}">Edit</button>
                    <button class="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded btn-delete-post" data-id="${post.id}">Delete</button>

                    ${publishModeView}
                    
                </div>
            </div>
        </div>
    `;

    // Append the post to the list
    $listpostParentID.append(postTemplate);
};

// Get the List of All categories

const fetchAllCategories = () => {
    $.ajax({
        url: `http://localhost/headless-App/wp_app/wp-json/wp/v2/categories`,
        method: "GET",
        dataType: "json",
        headers: {
            'Content-Type': 'application/json',
        },
        success: function (response) {
            let addPostCategoryID = $('#postCategory');
            let editPostCategoryID = $('#editPostCategory');
            let categoryHtml = `<option>- Select -</option>`;

            // Clear existing options before appending
            addPostCategoryID.empty();
            editPostCategoryID.empty();

            // Loop through the response and append category options
            response.forEach((category) => {
                categoryHtml += `<option value="${category.id}">${category.name}</option>`;
            });

            // Append categories to both post creation and edit model select elements
            addPostCategoryID.append(categoryHtml);
            editPostCategoryID.append(categoryHtml);
        },
        error: function (error) {
            console.log("Error fetching categories:", error);
        }
    });
}

// Create wp post

const createWpPost = (postData, callback = null) => {
    $.ajax({
        url: "http://localhost/headless-App/wp_app/wp-json/wp/v2/posts",
        method: "POST",
        dataType: "json",
        data: JSON.stringify(postData), // Convert the object to JSON
        contentType: "application/json",      // Set content type to JSON
        headers: {
            'Authorization': 'Basic ' + btoa('Alizaib:b*T8fFoit)dvIhslyC') // Replace with your username and application password
        },
        success: function (response) {
            // Call the callback function (if provided) after post creation
            if (callback) {
                callback(response);
            }

            // Hide the loader or provide success feedback
            $(".page-loader").addClass("hide_element");

            // Optional: Ask before reloading the page
            if (confirm("Post created successfully! Do you want to reload the page?")) {
                location.reload();
            }
        },
        error: function (error) {
            console.log("Error creating post:", error);
            alert("Error creating post. Please check the console for details.");
        }
    });
};



// Read Single post Data

const getSinglePostData = (postID, callback) => {
    $.ajax({
        url: `http://localhost/headless-App/wp_app/wp-json/wp/v2/posts/${postID}`,
        method: "GET", // Change method to GET since you're fetching data
        dataType: "json",
        headers: {
            'Authorization': 'Basic ' + btoa('Alizaib:b*T8fFoit)dvIhslyC') // Replace with your username and application password
        },
        success: function (response) {
            // Call the callback function (if provided) with the fetched data
            if (callback) {
                callback(response);
            }

            // Optional: Hide loader or provide feedback
            $(".page-loader").addClass("hide_element");
        },
        error: function (error) {
            console.log("Error fetching post data:", error);
        }
    });
};

const updateWPPost = (postID, postData) => {

    $.ajax({
        url: `http://localhost/headless-App/wp_app/wp-json/wp/v2/posts/${postID}`,
        method: "POST", // Use POST for updating
        dataType: "json",
        contentType: "application/json", // Ensure the content type is set to JSON
        data: JSON.stringify(postData),  // Convert postData to a JSON string
        headers: {
            'Authorization': 'Basic ' + btoa('Alizaib:b*T8fFoit)dvIhslyC') // Replace with your username and application password
        },
        success: function (response) {
            // Optional: Provide feedback or handle the response
            console.log(response);
            location.reload();

        },
        error: function (error) {
            console.log("Error updating post data:", error);
        }
    });
}


// Delete Post

const deleteWPPost = (postID, callback) => {

    $.ajax({
        url: `http://localhost/headless-App/wp_app/wp-json/wp/v2/posts/${postID}?force=true`,
        method: "DELETE",
        dataType: "json",
        contentType: "application/json", // Ensure the content type is set to JSON
        headers: {
            'Authorization': 'Basic ' + btoa('Alizaib:b*T8fFoit)dvIhslyC') // Replace with your username and application password
        },
        success: function (response) {
            // Optional: Provide feedback or handle the response
            callback(true);
            location.reload();

        },
        error: function (error) {
            console.log("Error updating post data:", error);
            callback(true);
            return false
        }
    });
}




