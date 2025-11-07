from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer, PostCreateSerializer


class PostListCreateView(generics.ListCreateAPIView):
    """
    GET: List all posts (newest first)
    POST: Create new post
    """
    queryset = Post.objects.all().select_related('user').prefetch_related('comments')
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostCreateSerializer
        return PostSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve post details
    PUT/PATCH: Update post (only owner)
    DELETE: Delete post (only owner)
    """
    queryset = Post.objects.all().select_related('user').prefetch_related('comments')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PostCreateSerializer
        return PostSerializer
    
    def update(self, request, *args, **kwargs):
        post = self.get_object()
        
        # Check if user is the owner
        if post.user != request.user:
            return Response(
                {'error': 'You do not have permission to edit this post'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        post = self.get_object()
        
        # Check if user is the owner
        if post.user != request.user:
            return Response(
                {'error': 'You do not have permission to delete this post'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)


class UserPostsView(generics.ListAPIView):
    """GET: List all posts by a specific user"""
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        username = self.kwargs.get('username')
        return Post.objects.filter(
            user__username=username
        ).select_related('user').prefetch_related('comments')


class MyPostsView(generics.ListAPIView):
    """GET: List current user's posts"""
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Post.objects.filter(
            user=self.request.user
        ).select_related('user').prefetch_related('comments')


class CommentListCreateView(APIView):
    """
    GET: List comments for a post
    POST: Add comment to a post
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        comments = post.comments.all().select_related('user')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve comment
    PUT/PATCH: Update comment (only owner)
    DELETE: Delete comment (only owner)
    """
    queryset = Comment.objects.all().select_related('user', 'post')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def update(self, request, *args, **kwargs):
        comment = self.get_object()
        
        # Check if user is the owner
        if comment.user != request.user:
            return Response(
                {'error': 'You do not have permission to edit this comment'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        
        # Check if user is the owner
        if comment.user != request.user:
            return Response(
                {'error': 'You do not have permission to delete this comment'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)


class MyCommentsView(generics.ListAPIView):
    """GET: List current user's comments"""
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Comment.objects.filter(
            user=self.request.user
        ).select_related('user', 'post')


class CommunityStatisticsView(APIView):
    """GET: Community statistics"""
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get(self, request):
        total_posts = Post.objects.count()
        total_comments = Comment.objects.count()
        
        # Get recent posts
        recent_posts = Post.objects.all()[:5]
        
        # Get most active users
        from django.db.models import Count
        active_users = Post.objects.values(
            'user__username'
        ).annotate(
            post_count=Count('id')
        ).order_by('-post_count')[:5]
        
        return Response({
            'total_posts': total_posts,
            'total_comments': total_comments,
            'recent_posts': PostSerializer(recent_posts, many=True).data,
            'most_active_users': list(active_users)
        })


class SearchPostsView(generics.ListAPIView):
    """GET: Search posts by title or content"""
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        
        if query:
            return Post.objects.filter(
                title__icontains=query
            ) | Post.objects.filter(
                content__icontains=query
            )
        
        return Post.objects.none()