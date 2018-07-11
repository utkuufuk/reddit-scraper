'use strict';

$(function() {
    // cache some HTML elements
    var $posts = $('#posts');
    var $name = $('#name');
    var $drink = $('#drink');
    var $id = $('#id');

    // creates an order <li> in the HTML document
    function addPost(post) {
        $posts.append('<li><strong>Title:</strong> ' + post.title + '<br>' +
                       '<strong>Author:</strong> ' + post.author + '<br>' +
                       '<strong>Score:</strong> ' + post.score + '<br>' +
                       '<strong>Date:</strong> ' + post.date + '<br>' +
                       '<strong>Subreddit:</strong> ' + post.subreddit + '<br>' +
                       '<strong>URL:</strong> ' + post.url + '<br>' +
                       '<strong>Comments Count:</strong> ' + post.comments.count + '<br>' +
                       '<button data-id=' + post.id + ' class="expand">Show Comments</button></li>');
    }

    // fetch & display all posts
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/product',
        success: function(posts) {
            // write retrieved posts into HTML
            $.each(posts, function(i, post) {
                addPost(post);
            });
        },
        error: function() {
            alert('error loading posts');
        }
    });

/*
    // create a POST request to place an order whenever the ADD button is clicked
    $('#add-order').on('click', function() {
        // create an order object to send to backend
        var order = {
            name: $name.val(),
            drink: $drink.val(),
        };

        $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/orders',
            data: order,
            success: function(newOrder) {
                addOrder(newOrder);
            },
            error: function() {
                alert('error saving order');
            }
        });
    });

    // $('.remove').on.('click') won't work because AJAX is asynchronous!!!
    $orders.on('click', '.remove', function() {
        // cache the <li> and 'data-id' attribute associated with the button
        var $li = $(this).closest('li');
        var dataId = $(this).attr('data-id');

        // send a DELETE request whenever the X button is clicked
        $.ajax({
            type: 'DELETE',
            url: 'http://localhost:3000/orders/' + dataId,
            success: function() {
                $li.fadeOut(500);
            },
            error: function() {
                alert('error deleting order');
            }
        });
    });
});
*/
