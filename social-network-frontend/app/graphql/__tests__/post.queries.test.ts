import {
    GET_USER_POSTS,
    CREATE_POST,
    LIKE_POST,
    UNLIKE_POST,
    COMMENT_ON_POST,
    UPDATE_POST,
    DELETE_POST,
    GET_POST_COMMENTS
} from '../../graphql/post.queries';

import {
    DefinitionNode,
    OperationDefinitionNode,
    FieldNode,
    SelectionSetNode
} from 'graphql';

// ✅ تابع کمکی برای پیدا کردن OperationDefinition
const findOperation = (definitions: readonly DefinitionNode[], operationName: string): OperationDefinitionNode | undefined => {
    return definitions.find(
        (def): def is OperationDefinitionNode =>
            def.kind === 'OperationDefinition' && def.name?.value === operationName
    );
};

// ✅ تابع کمکی برای گرفتن نام فیلدها از selectionSet
const getFieldNamesFromSelectionSet = (selectionSet: SelectionSetNode): string[] => {
    const fields: string[] = [];

    selectionSet.selections.forEach((selection) => {
        if (selection.kind === 'Field') {
            const field = selection as FieldNode;
            if (field.name.value) {
                fields.push(field.name.value);
            }
        }
    });

    return fields;
};

// ✅ تابع کمکی برای گرفتن نام فیلدهای سطح بالا از عملیات
const getFieldNames = (definition: OperationDefinitionNode): string[] => {
    const selectionSet = definition.selectionSet;
    if (!selectionSet) return [];
    return getFieldNamesFromSelectionSet(selectionSet);
};

// ✅ تابع کمکی برای گرفتن نام فیلدهای تو در توی یک فیلد خاص
const getNestedFieldNames = (
    definition: OperationDefinitionNode,
    parentFieldName: string
): string[] => {
    const selectionSet = definition.selectionSet;
    if (!selectionSet) return [];

    const parentField = selectionSet.selections.find(
        (selection): selection is FieldNode =>
            selection.kind === 'Field' && selection.name.value === parentFieldName
    );

    if (!parentField || !parentField.selectionSet) return [];

    return getFieldNamesFromSelectionSet(parentField.selectionSet);
};

// ✅ تابع کمکی برای گرفتن نام فیلدهای تو در توی یک فیلد تو در تو (دو سطح)
// مثلاً "createPost { post { user { id } } }"
const getDeeplyNestedFieldNames = (
    definition: OperationDefinitionNode,
    parentFieldName: string,
    childFieldName: string
): string[] => {
    const selectionSet = definition.selectionSet;
    if (!selectionSet) return [];

    const parentField = selectionSet.selections.find(
        (selection): selection is FieldNode =>
            selection.kind === 'Field' && selection.name.value === parentFieldName
    );

    if (!parentField || !parentField.selectionSet) return [];

    const childField = parentField.selectionSet.selections.find(
        (selection): selection is FieldNode =>
            selection.kind === 'Field' && selection.name.value === childFieldName
    );

    if (!childField || !childField.selectionSet) return [];

    return getFieldNamesFromSelectionSet(childField.selectionSet);
};

// ✅ تابع کمکی برای گرفتن نام متغیرها
const getVariableNames = (definition: OperationDefinitionNode): string[] => {
    const variableDefs = definition.variableDefinitions || [];
    return variableDefs.map((v: any) => v.variable.name.value);
};

describe('Post Queries', () => {
    // ==========================================================
    //  تست‌های GET_USER_POSTS
    // ==========================================================
    it('should have correct GET_USER_POSTS query structure', () => {
        expect(GET_USER_POSTS).toBeDefined();
        expect(GET_USER_POSTS.kind).toBe('Document');
        expect(GET_USER_POSTS.definitions).toBeDefined();
        expect(GET_USER_POSTS.definitions.length).toBeGreaterThan(0);
    });

    it('GET_USER_POSTS query should be named "GetUserPosts"', () => {
        const definition = findOperation(GET_USER_POSTS.definitions, 'GetUserPosts');
        expect(definition).toBeDefined();
        expect(definition?.name?.value).toBe('GetUserPosts');
    });

    it('GET_USER_POSTS query should have correct variables', () => {
        const definition = findOperation(GET_USER_POSTS.definitions, 'GetUserPosts');
        expect(definition).toBeDefined();

        const variableNames = getVariableNames(definition!);
        expect(variableNames).toContain('userId');
        expect(variableNames).toContain('limit');
        expect(variableNames).toContain('offset');
        expect(variableNames).toHaveLength(3);
    });

    it('GET_USER_POSTS query top-level field should be "getUserPosts"', () => {
        const definition = findOperation(GET_USER_POSTS.definitions, 'GetUserPosts');
        expect(definition).toBeDefined();

        const fieldNames = getFieldNames(definition!);
        expect(fieldNames).toContain('getUserPosts');
    });

    it('GET_USER_POSTS query should request all post fields including nested user', () => {
        const definition = findOperation(GET_USER_POSTS.definitions, 'GetUserPosts');
        expect(definition).toBeDefined();

        const fieldNames = getNestedFieldNames(definition!, 'getUserPosts');
        expect(fieldNames).toContain('id');
        expect(fieldNames).toContain('content');
        expect(fieldNames).toContain('createdAt');
        expect(fieldNames).toContain('updatedAt');
        expect(fieldNames).toContain('isPublished');
        expect(fieldNames).toContain('likesCount');
        expect(fieldNames).toContain('commentsCount');
        expect(fieldNames).toContain('isLiked');
        expect(fieldNames).toContain('user');

        const userFieldNames = getDeeplyNestedFieldNames(definition!, 'getUserPosts', 'user');
        expect(userFieldNames).toContain('id');
        expect(userFieldNames).toContain('username');
        expect(userFieldNames).toContain('fullName');
        expect(userFieldNames).toContain('avatar');
    });

    // ==========================================================
    //  تست‌های CREATE_POST
    // ==========================================================
    it('should have correct CREATE_POST mutation structure', () => {
        expect(CREATE_POST).toBeDefined();
        expect(CREATE_POST.kind).toBe('Document');
        expect(CREATE_POST.definitions).toBeDefined();
        expect(CREATE_POST.definitions.length).toBeGreaterThan(0);
    });

    it('CREATE_POST mutation should be named "CreatePost"', () => {
        const definition = findOperation(CREATE_POST.definitions, 'CreatePost');
        expect(definition).toBeDefined();
        expect(definition?.name?.value).toBe('CreatePost');
    });

    it('CREATE_POST mutation should have correct variables', () => {
        const definition = findOperation(CREATE_POST.definitions, 'CreatePost');
        expect(definition).toBeDefined();

        const variableNames = getVariableNames(definition!);
        expect(variableNames).toContain('content');
        expect(variableNames).toHaveLength(1);
    });

    it('CREATE_POST mutation top-level field should be "createPost"', () => {
        const definition = findOperation(CREATE_POST.definitions, 'CreatePost');
        expect(definition).toBeDefined();

        const fieldNames = getFieldNames(definition!);
        expect(fieldNames).toContain('createPost');
    });

    it('CREATE_POST mutation should request success, message and post', () => {
        const definition = findOperation(CREATE_POST.definitions, 'CreatePost');
        expect(definition).toBeDefined();

        const fieldNames = getNestedFieldNames(definition!, 'createPost');
        expect(fieldNames).toContain('success');
        expect(fieldNames).toContain('message');
        expect(fieldNames).toContain('post');
    });

    it('CREATE_POST mutation should request nested post fields including user', () => {
        const definition = findOperation(CREATE_POST.definitions, 'CreatePost');
        expect(definition).toBeDefined();

        const postFieldNames = getDeeplyNestedFieldNames(definition!, 'createPost', 'post');
        expect(postFieldNames).toContain('id');
        expect(postFieldNames).toContain('content');
        expect(postFieldNames).toContain('createdAt');
        expect(postFieldNames).toContain('user');
        expect(postFieldNames).toContain('likesCount');
        expect(postFieldNames).toContain('commentsCount');
        expect(postFieldNames).toContain('isLiked');
    });

    // ==========================================================
    //  تست‌های LIKE_POST
    // ==========================================================
    it('should have correct LIKE_POST mutation structure', () => {
        expect(LIKE_POST).toBeDefined();
        expect(LIKE_POST.kind).toBe('Document');
        expect(LIKE_POST.definitions).toBeDefined();
        expect(LIKE_POST.definitions.length).toBeGreaterThan(0);
    });

    it('LIKE_POST mutation should be named "LikePost"', () => {
        const definition = findOperation(LIKE_POST.definitions, 'LikePost');
        expect(definition).toBeDefined();
        expect(definition?.name?.value).toBe('LikePost');
    });

    it('LIKE_POST mutation should have correct variables', () => {
        const definition = findOperation(LIKE_POST.definitions, 'LikePost');
        expect(definition).toBeDefined();

        const variableNames = getVariableNames(definition!);
        expect(variableNames).toContain('postId');
        expect(variableNames).toHaveLength(1);
    });

    it('LIKE_POST mutation top-level field should be "likePost"', () => {
        const definition = findOperation(LIKE_POST.definitions, 'LikePost');
        expect(definition).toBeDefined();

        const fieldNames = getFieldNames(definition!);
        expect(fieldNames).toContain('likePost');
    });

    it('LIKE_POST mutation should request success, message and isLiked', () => {
        const definition = findOperation(LIKE_POST.definitions, 'LikePost');
        expect(definition).toBeDefined();

        const fieldNames = getNestedFieldNames(definition!, 'likePost');
        expect(fieldNames).toContain('success');
        expect(fieldNames).toContain('message');
        expect(fieldNames).toContain('isLiked');
    });

    // ==========================================================
    //  تست‌های UNLIKE_POST
    // ==========================================================
    it('should have correct UNLIKE_POST mutation structure', () => {
        expect(UNLIKE_POST).toBeDefined();
        expect(UNLIKE_POST.kind).toBe('Document');
        expect(UNLIKE_POST.definitions).toBeDefined();
        expect(UNLIKE_POST.definitions.length).toBeGreaterThan(0);
    });

    it('UNLIKE_POST mutation should be named "UnlikePost"', () => {
        const definition = findOperation(UNLIKE_POST.definitions, 'UnlikePost');
        expect(definition).toBeDefined();
        expect(definition?.name?.value).toBe('UnlikePost');
    });

    it('UNLIKE_POST mutation should have correct variables', () => {
        const definition = findOperation(UNLIKE_POST.definitions, 'UnlikePost');
        expect(definition).toBeDefined();

        const variableNames = getVariableNames(definition!);
        expect(variableNames).toContain('postId');
        expect(variableNames).toHaveLength(1);
    });

    it('UNLIKE_POST mutation top-level field should be "unlikePost"', () => {
        const definition = findOperation(UNLIKE_POST.definitions, 'UnlikePost');
        expect(definition).toBeDefined();

        const fieldNames = getFieldNames(definition!);
        expect(fieldNames).toContain('unlikePost');
    });

    it('UNLIKE_POST mutation should request success, message and isLiked', () => {
        const definition = findOperation(UNLIKE_POST.definitions, 'UnlikePost');
        expect(definition).toBeDefined();

        const fieldNames = getNestedFieldNames(definition!, 'unlikePost');
        expect(fieldNames).toContain('success');
        expect(fieldNames).toContain('message');
        expect(fieldNames).toContain('isLiked');
    });

    // ==========================================================
    //  تست‌های COMMENT_ON_POST
    // ==========================================================
    it('should have correct COMMENT_ON_POST mutation structure', () => {
        expect(COMMENT_ON_POST).toBeDefined();
        expect(COMMENT_ON_POST.kind).toBe('Document');
        expect(COMMENT_ON_POST.definitions).toBeDefined();
        expect(COMMENT_ON_POST.definitions.length).toBeGreaterThan(0);
    });

    it('COMMENT_ON_POST mutation should be named "CommentOnPost"', () => {
        const definition = findOperation(COMMENT_ON_POST.definitions, 'CommentOnPost');
        expect(definition).toBeDefined();
        expect(definition?.name?.value).toBe('CommentOnPost');
    });

    it('COMMENT_ON_POST mutation should have correct variables', () => {
        const definition = findOperation(COMMENT_ON_POST.definitions, 'CommentOnPost');
        expect(definition).toBeDefined();

        const variableNames = getVariableNames(definition!);
        expect(variableNames).toContain('postId');
        expect(variableNames).toContain('content');
        expect(variableNames).toHaveLength(2);
    });

    it('COMMENT_ON_POST mutation top-level field should be "commentOnPost"', () => {
        const definition = findOperation(COMMENT_ON_POST.definitions, 'CommentOnPost');
        expect(definition).toBeDefined();

        const fieldNames = getFieldNames(definition!);
        expect(fieldNames).toContain('commentOnPost');
    });

    it('COMMENT_ON_POST mutation should request success, message and comment', () => {
        const definition = findOperation(COMMENT_ON_POST.definitions, 'CommentOnPost');
        expect(definition).toBeDefined();

        const fieldNames = getNestedFieldNames(definition!, 'commentOnPost');
        expect(fieldNames).toContain('success');
        expect(fieldNames).toContain('message');
        expect(fieldNames).toContain('comment');
    });

    it('COMMENT_ON_POST mutation should request nested comment fields including user', () => {
        const definition = findOperation(COMMENT_ON_POST.definitions, 'CommentOnPost');
        expect(definition).toBeDefined();

        const commentFieldNames = getDeeplyNestedFieldNames(definition!, 'commentOnPost', 'comment');
        expect(commentFieldNames).toContain('id');
        expect(commentFieldNames).toContain('content');
        expect(commentFieldNames).toContain('createdAt');
        expect(commentFieldNames).toContain('user');
        expect(commentFieldNames).toContain('likesCount');
        expect(commentFieldNames).toContain('isLiked');
    });

    // ==========================================================
    //  تست‌های UPDATE_POST
    // ==========================================================
    it('should have correct UPDATE_POST mutation structure', () => {
        expect(UPDATE_POST).toBeDefined();
        expect(UPDATE_POST.kind).toBe('Document');
        expect(UPDATE_POST.definitions).toBeDefined();
        expect(UPDATE_POST.definitions.length).toBeGreaterThan(0);
    });

    it('UPDATE_POST mutation should be named "UpdatePost"', () => {
        const definition = findOperation(UPDATE_POST.definitions, 'UpdatePost');
        expect(definition).toBeDefined();
        expect(definition?.name?.value).toBe('UpdatePost');
    });

    it('UPDATE_POST mutation should have correct variables', () => {
        const definition = findOperation(UPDATE_POST.definitions, 'UpdatePost');
        expect(definition).toBeDefined();

        const variableNames = getVariableNames(definition!);
        expect(variableNames).toContain('postId');
        expect(variableNames).toContain('content');
        expect(variableNames).toHaveLength(2);
    });

    it('UPDATE_POST mutation top-level field should be "updatePost"', () => {
        const definition = findOperation(UPDATE_POST.definitions, 'UpdatePost');
        expect(definition).toBeDefined();

        const fieldNames = getFieldNames(definition!);
        expect(fieldNames).toContain('updatePost');
    });

    it('UPDATE_POST mutation should request success, message and post', () => {
        const definition = findOperation(UPDATE_POST.definitions, 'UpdatePost');
        expect(definition).toBeDefined();

        const fieldNames = getNestedFieldNames(definition!, 'updatePost');
        expect(fieldNames).toContain('success');
        expect(fieldNames).toContain('message');
        expect(fieldNames).toContain('post');
    });

    it('UPDATE_POST mutation should request nested post fields including updatedAt and user', () => {
        const definition = findOperation(UPDATE_POST.definitions, 'UpdatePost');
        expect(definition).toBeDefined();

        const postFieldNames = getDeeplyNestedFieldNames(definition!, 'updatePost', 'post');
        expect(postFieldNames).toContain('id');
        expect(postFieldNames).toContain('content');
        expect(postFieldNames).toContain('createdAt');
        expect(postFieldNames).toContain('updatedAt');
        expect(postFieldNames).toContain('user');
        expect(postFieldNames).toContain('likesCount');
        expect(postFieldNames).toContain('commentsCount');
        expect(postFieldNames).toContain('isLiked');
    });

    it('UPDATE_POST mutation should request correct nested user fields including avatar', () => {
        const definition = findOperation(UPDATE_POST.definitions, 'UpdatePost');
        expect(definition).toBeDefined();

        const selectionSet = definition!.selectionSet;
        const updatePostField = selectionSet.selections.find(
            (s): s is FieldNode => s.kind === 'Field' && s.name.value === 'updatePost'
        );
        const postField = updatePostField?.selectionSet?.selections.find(
            (s): s is FieldNode => s.kind === 'Field' && s.name.value === 'post'
        );
        const userField = postField?.selectionSet?.selections.find(
            (s): s is FieldNode => s.kind === 'Field' && s.name.value === 'user'
        );

        expect(userField).toBeDefined();
        const userFieldNames = getFieldNamesFromSelectionSet(userField!.selectionSet!);
        expect(userFieldNames).toContain('id');
        expect(userFieldNames).toContain('username');
        expect(userFieldNames).toContain('fullName');
        expect(userFieldNames).toContain('avatar');
    });

    // ==========================================================
    //  تست‌های DELETE_POST
    // ==========================================================
    it('should have correct DELETE_POST mutation structure', () => {
        expect(DELETE_POST).toBeDefined();
        expect(DELETE_POST.kind).toBe('Document');
        expect(DELETE_POST.definitions).toBeDefined();
        expect(DELETE_POST.definitions.length).toBeGreaterThan(0);
    });

    it('DELETE_POST mutation should be named "DeletePost"', () => {
        const definition = findOperation(DELETE_POST.definitions, 'DeletePost');
        expect(definition).toBeDefined();
        expect(definition?.name?.value).toBe('DeletePost');
    });

    it('DELETE_POST mutation should have correct variables', () => {
        const definition = findOperation(DELETE_POST.definitions, 'DeletePost');
        expect(definition).toBeDefined();

        const variableNames = getVariableNames(definition!);
        expect(variableNames).toContain('postId');
        expect(variableNames).toHaveLength(1);
    });

    it('DELETE_POST mutation top-level field should be "deletePost"', () => {
        const definition = findOperation(DELETE_POST.definitions, 'DeletePost');
        expect(definition).toBeDefined();

        const fieldNames = getFieldNames(definition!);
        expect(fieldNames).toContain('deletePost');
    });

    it('DELETE_POST mutation should request success and message', () => {
        const definition = findOperation(DELETE_POST.definitions, 'DeletePost');
        expect(definition).toBeDefined();

        const fieldNames = getNestedFieldNames(definition!, 'deletePost');
        expect(fieldNames).toContain('success');
        expect(fieldNames).toContain('message');
    });

    // ==========================================================
    //  تست‌های GET_POST_COMMENTS
    // ==========================================================
    it('should have correct GET_POST_COMMENTS query structure', () => {
        expect(GET_POST_COMMENTS).toBeDefined();
        expect(GET_POST_COMMENTS.kind).toBe('Document');
        expect(GET_POST_COMMENTS.definitions).toBeDefined();
        expect(GET_POST_COMMENTS.definitions.length).toBeGreaterThan(0);
    });

    it('GET_POST_COMMENTS query should be named "GetPostComments"', () => {
        const definition = findOperation(GET_POST_COMMENTS.definitions, 'GetPostComments');
        expect(definition).toBeDefined();
        expect(definition?.name?.value).toBe('GetPostComments');
    });

    it('GET_POST_COMMENTS query should have correct variables', () => {
        const definition = findOperation(GET_POST_COMMENTS.definitions, 'GetPostComments');
        expect(definition).toBeDefined();

        const variableNames = getVariableNames(definition!);
        expect(variableNames).toContain('postId');
        expect(variableNames).toHaveLength(1);
    });

    it('GET_POST_COMMENTS query top-level field should be "getPost"', () => {
        const definition = findOperation(GET_POST_COMMENTS.definitions, 'GetPostComments');
        expect(definition).toBeDefined();

        const fieldNames = getFieldNames(definition!);
        expect(fieldNames).toContain('getPost');
    });

    it('GET_POST_COMMENTS query should request "id" and "comments" fields', () => {
        const definition = findOperation(GET_POST_COMMENTS.definitions, 'GetPostComments');
        expect(definition).toBeDefined();

        const getPostFieldNames = getNestedFieldNames(definition!, 'getPost');
        expect(getPostFieldNames).toContain('id');
        expect(getPostFieldNames).toContain('comments');
    });

    it('GET_POST_COMMENTS query should request nested comment fields including user', () => {
        const definition = findOperation(GET_POST_COMMENTS.definitions, 'GetPostComments');
        expect(definition).toBeDefined();

        // پیدا کردن فیلد getPost
        const selectionSet = definition!.selectionSet;
        const getPostField = selectionSet.selections.find(
            (s): s is FieldNode => s.kind === 'Field' && s.name.value === 'getPost'
        );

        expect(getPostField).toBeDefined();

        // پیدا کردن فیلد comments داخل getPost
        const commentsField = getPostField?.selectionSet?.selections.find(
            (s): s is FieldNode => s.kind === 'Field' && s.name.value === 'comments'
        );

        expect(commentsField).toBeDefined();

        // گرفتن نام فیلدهای داخل comments
        const commentFieldNames = getFieldNamesFromSelectionSet(commentsField!.selectionSet!);
        expect(commentFieldNames).toContain('id');
        expect(commentFieldNames).toContain('content');
        expect(commentFieldNames).toContain('createdAt');
        expect(commentFieldNames).toContain('user');
    });

    it('GET_POST_COMMENTS query should request correct nested user fields', () => {
        const definition = findOperation(GET_POST_COMMENTS.definitions, 'GetPostComments');
        expect(definition).toBeDefined();

        // پیدا کردن فیلد getPost
        const selectionSet = definition!.selectionSet;
        const getPostField = selectionSet.selections.find(
            (s): s is FieldNode => s.kind === 'Field' && s.name.value === 'getPost'
        );

        // پیدا کردن فیلد comments داخل getPost
        const commentsField = getPostField?.selectionSet?.selections.find(
            (s): s is FieldNode => s.kind === 'Field' && s.name.value === 'comments'
        );

        // پیدا کردن فیلد user داخل comments
        const userField = commentsField?.selectionSet?.selections.find(
            (s): s is FieldNode => s.kind === 'Field' && s.name.value === 'user'
        );

        expect(userField).toBeDefined();

        // گرفتن نام فیلدهای داخل user
        const userFieldNames = getFieldNamesFromSelectionSet(userField!.selectionSet!);
        expect(userFieldNames).toContain('id');
        expect(userFieldNames).toContain('username');
        expect(userFieldNames).toContain('fullName');
        expect(userFieldNames).toContain('avatar');
    });
});