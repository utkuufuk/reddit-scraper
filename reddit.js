'use strict';

$(function() {
    let postsHidden = {};
    let commentsHidden = {};
    let keywords = [];
    let $keywords = $('#keywords');

    function toggleButton($element, $button, name, flagId, flagMap)
    {
         $element.slideToggle(500, function() {
            if (flagMap[flagId]) {
                $button.html('Hide ' + name);
                commentsHidden[flagId] = false;
            }
            else {
                $button.html('Show ' + name);
                flagMap[flagId] = true;
            }
        });
    }

    function addComment(comment, commentId, $comments) {
        $comments.append('<li><strong>ID: </strong>' + commentId + '<br>' +
                         '<strong>Text: </strong>' + comment.text + '<br>' +
                         '<strong>Author: </strong>' + comment.author + '<br>' +
                         '<strong>Date: </strong>' + comment.date + '<br>' +
                         '<strong>Score: </strong>' + comment.score + '<br>' +
                         '<strong>Number of Replies: </strong>' + comment['num-replies'] + '<br>' +
                         '<strong>Reply To: </strong>' + comment['reply-to'] + '</li>');
    }

    function addPost(post, $posts) {
        let postId = post.date.replace(/\s/g, "");
        $posts.append('<li><strong>Title: </strong>' + post.title + '<br>' +
                      '<strong>Author: </strong>' + post.author + '<br>' +
                      '<strong>Score: </strong>' + post.score + '<br>' +
                      '<strong>Date: </strong>' + post.date + '<br>' +
                      '<strong>Subreddit: </strong>' + post.subreddit + '<br>' +
                      '<strong>URL: </strong>' + post.url + '<br>' +
                      '<strong>Number of Comments: </strong>' + Object.keys(post['comments']).length + '<br>' +
                      '<button post-id=' + postId + ' class="toggle-comments">Show Comments</button>' +
                      '<ul class="comments"></ul></li>');
    }

    function addKeyword(keyword, product) {
        $keywords.append('<li><strong>' + keyword + '</strong><br>' +
                         '<strong>Last Crawl Date: </strong>' + product[keyword]['timestamp'] + '<br>' +
                         '<strong>Subreddit: </strong> r/' + product[keyword]['subreddit'] + '<br>' +
                         '<strong>Number of Posts: </strong>' + product[keyword]['posts'].length + '<br>' +
                         '<button keyword="' + keyword + '" class="toggle-posts">Show Posts</button>' +
                         '<ul class="posts"></ul></li>');
    }

    $.ajax({
        type: 'GET',
        async: false,
        url: 'http://localhost:3000/db/',
        success: function(product) {
            $.each(Object.keys(product), function(i, keyword) {
                addKeyword(keyword, product);
                keywords[i] = keyword;
            });
        },
        error: function() {
            alert('error loading keywords');
        }
    });

    for (let k = 0; k < keywords.length; k++) {
        let $posts = $('.posts').eq(k);
        let keyword = keywords[k];
        postsHidden[keyword] = true;
        $posts.hide();

        $.ajax({
            type: 'GET',
            url: 'http://localhost:3000/' + keyword + '/',
            success: function(product) {
                $.each(product['posts'], function(i, post) {
                    addPost(post, $posts);
                    let commentKeys = Object.keys(post['comments']);

                    for (let c = 0; c < commentKeys.length; c++) {
                        let $comments = $posts.find('.comments').eq(i);
                        $comments.hide();
                        commentsHidden[post.date.replace(/\s/g, "")] = true;
                        addComment(post['comments'][commentKeys[c]], commentKeys[c], $comments);    
                    }
                });
            },
            error: function() {
                alert('error loading posts');
            }
        });
    }

    $keywords.on('click', '.toggle-posts', function() {
        let $posts = $(this).closest('li').find('.posts');
        let $button = $(this).closest('li').find('.toggle-posts');
        let keyword = $(this).attr('keyword'); 
        toggleButton($posts, $button, "Posts", keyword, postsHidden)
    });

    $keywords.on('click', '.toggle-comments', function() {
        let $comments = $(this).closest('li').find('.comments');
        let $button = $(this).closest('li').find('.toggle-comments');
        let postId = $(this).attr('post-id'); 
        toggleButton($comments, $button, "Comments", postId, commentsHidden)
    });
});
