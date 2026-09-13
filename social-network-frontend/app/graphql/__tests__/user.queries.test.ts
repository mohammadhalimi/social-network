import {
    SEARCH_USERS,
    GET_USER_BY_USERNAME,
    FOLLOW_USER,
    UNFOLLOW_USER,
    GET_FOLLOWERS,
    GET_FOLLOWING,
} from '../../graphql/user.queries';

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

describe('User Queries', () => {
    // ==========================================================
    //  تست‌های SEARCH_USERS
    // ==========================================================
    it('should have correct SEARCH_USERS query structure', () => {
        expect(SEARCH_USERS).toBeDefined();
        expect(SEARCH_USERS.kind).toBe('Document');
        expect(SEARCH_USERS.definitions).toBeDefined();
        expect(SEARCH_USERS.definitions.length).toBeGreaterThan(0);
    });

    it('SEARCH_USERS query should be named "SearchUsers"', () => {
        const definition = findOperation(SEARCH_USERS.definitions, 'SearchUsers');
        expect(definition).toBeDefined();
        expect(definition?.name?.value).toBe('SearchUsers');
    });

    it('SEARCH_USERS query should have correct variables', () => {
        const definition = findOperation(SEARCH_USERS.definitions, 'SearchUsers');
        expect(definition).toBeDefined();

        const variableNames = getVariableNames(definition!);
        expect(variableNames).toContain('searchTerm');
        expect(variableNames).toContain('limit');
        expect(variableNames).toContain('offset');
        expect(variableNames).toHaveLength(3);
    });

    it('SEARCH_USERS query top-level field should be "searchUsers"', () => {
        const definition = findOperation(SEARCH_USERS.definitions, 'SearchUsers');
        expect(definition).toBeDefined();

        const fieldNames = getFieldNames(definition!);
        expect(fieldNames).toContain('searchUsers');
    });

    it('SEARCH_USERS query should request users, totalCount and hasMore', () => {
        const definition = findOperation(SEARCH_USERS.definitions, 'SearchUsers');
        expect(definition).toBeDefined();

        const fieldNames = getNestedFieldNames(definition!, 'searchUsers');
        expect(fieldNames).toContain('users');
        expect(fieldNames).toContain('totalCount');
        expect(fieldNames).toContain('hasMore');
    });

    it('SEARCH_USERS query should request correct nested user fields', () => {
        const definition = findOperation(SEARCH_USERS.definitions, 'SearchUsers');
        expect(definition).toBeDefined();

        const userFieldNames = getDeeplyNestedFieldNames(definition!, 'searchUsers', 'users');
        expect(userFieldNames).toContain('id');
        expect(userFieldNames).toContain('username');
        expect(userFieldNames).toContain('fullName');
        expect(userFieldNames).toContain('bio');
        expect(userFieldNames).toContain('avatar');
    });

    // ==========================================================
    //  تست‌های GET_USER_BY_USERNAME
    // ==========================================================
    it('should have correct GET_USER_BY_USERNAME query structure', () => {
        expect(GET_USER_BY_USERNAME).toBeDefined();
        expect(GET_USER_BY_USERNAME.kind).toBe('Document');
        expect(GET_USER_BY_USERNAME.definitions).toBeDefined();
        expect(GET_USER_BY_USERNAME.definitions.length).toBeGreaterThan(0);
    });

    it('GET_USER_BY_USERNAME query should be named "GetUserByUsername"', () => {
        const definition = findOperation(GET_USER_BY_USERNAME.definitions, 'GetUserByUsername');
        expect(definition).toBeDefined();
        expect(definition?.name?.value).toBe('GetUserByUsername');
    });

    it('GET_USER_BY_USERNAME query should have correct variables', () => {
        const definition = findOperation(GET_USER_BY_USERNAME.definitions, 'GetUserByUsername');
        expect(definition).toBeDefined();

        const variableNames = getVariableNames(definition!);
        expect(variableNames).toContain('username');
        expect(variableNames).toHaveLength(1);
    });

    it('GET_USER_BY_USERNAME query top-level field should be "getUserByUsername"', () => {
        const definition = findOperation(GET_USER_BY_USERNAME.definitions, 'GetUserByUsername');
        expect(definition).toBeDefined();

        const fieldNames = getFieldNames(definition!);
        expect(fieldNames).toContain('getUserByUsername');
    });

    it('GET_USER_BY_USERNAME query should request all user profile fields', () => {
        const definition = findOperation(GET_USER_BY_USERNAME.definitions, 'GetUserByUsername');
        expect(definition).toBeDefined();

        const fieldNames = getNestedFieldNames(definition!, 'getUserByUsername');
        expect(fieldNames).toContain('id');
        expect(fieldNames).toContain('username');
        expect(fieldNames).toContain('fullName');
        expect(fieldNames).toContain('bio');
        expect(fieldNames).toContain('avatar');
        expect(fieldNames).toContain('createdAt');
        expect(fieldNames).toContain('updatedAt');
    });

    // ✅ تست جدید
    it('GET_USER_BY_USERNAME query should request follow-related fields', () => {
        const definition = findOperation(GET_USER_BY_USERNAME.definitions, 'GetUserByUsername');
        expect(definition).toBeDefined();

        const fieldNames = getNestedFieldNames(definition!, 'getUserByUsername');
        expect(fieldNames).toContain('followersCount');
        expect(fieldNames).toContain('followingCount');
        expect(fieldNames).toContain('isFollowing');
    });

    // ==========================================================
    //  ✅ تست‌های جدید: FOLLOW_USER
    // ==========================================================
    describe('FOLLOW_USER mutation', () => {
        it('should have correct structure', () => {
            expect(FOLLOW_USER).toBeDefined();
            expect(FOLLOW_USER.kind).toBe('Document');
            expect(FOLLOW_USER.definitions.length).toBeGreaterThan(0);
        });

        it('should be named "FollowUser"', () => {
            const definition = findOperation(FOLLOW_USER.definitions, 'FollowUser');
            expect(definition).toBeDefined();
            expect(definition?.operation).toBe('mutation');
        });

        it('should have userId variable', () => {
            const definition = findOperation(FOLLOW_USER.definitions, 'FollowUser');
            expect(definition).toBeDefined();

            const variableNames = getVariableNames(definition!);
            expect(variableNames).toContain('userId');
            expect(variableNames).toHaveLength(1);
        });

        it('top-level field should be "followUser"', () => {
            const definition = findOperation(FOLLOW_USER.definitions, 'FollowUser');
            expect(definition).toBeDefined();

            const fieldNames = getFieldNames(definition!);
            expect(fieldNames).toContain('followUser');
        });

        it('should request success, message, isFollowing and followersCount', () => {
            const definition = findOperation(FOLLOW_USER.definitions, 'FollowUser');
            expect(definition).toBeDefined();

            const fieldNames = getNestedFieldNames(definition!, 'followUser');
            expect(fieldNames).toContain('success');
            expect(fieldNames).toContain('message');
            expect(fieldNames).toContain('isFollowing');
            expect(fieldNames).toContain('followersCount');
        });
    });

    // ==========================================================
    //  ✅ تست‌های جدید: UNFOLLOW_USER
    // ==========================================================
    describe('UNFOLLOW_USER mutation', () => {
        it('should have correct structure', () => {
            expect(UNFOLLOW_USER).toBeDefined();
            expect(UNFOLLOW_USER.kind).toBe('Document');
            expect(UNFOLLOW_USER.definitions.length).toBeGreaterThan(0);
        });

        it('should be named "UnfollowUser"', () => {
            const definition = findOperation(UNFOLLOW_USER.definitions, 'UnfollowUser');
            expect(definition).toBeDefined();
            expect(definition?.operation).toBe('mutation');
        });

        it('should have userId variable', () => {
            const definition = findOperation(UNFOLLOW_USER.definitions, 'UnfollowUser');
            expect(definition).toBeDefined();

            const variableNames = getVariableNames(definition!);
            expect(variableNames).toContain('userId');
            expect(variableNames).toHaveLength(1);
        });

        it('top-level field should be "unfollowUser"', () => {
            const definition = findOperation(UNFOLLOW_USER.definitions, 'UnfollowUser');
            expect(definition).toBeDefined();

            const fieldNames = getFieldNames(definition!);
            expect(fieldNames).toContain('unfollowUser');
        });

        it('should request success, message, isFollowing and followersCount', () => {
            const definition = findOperation(UNFOLLOW_USER.definitions, 'UnfollowUser');
            expect(definition).toBeDefined();

            const fieldNames = getNestedFieldNames(definition!, 'unfollowUser');
            expect(fieldNames).toContain('success');
            expect(fieldNames).toContain('message');
            expect(fieldNames).toContain('isFollowing');
            expect(fieldNames).toContain('followersCount');
        });
    });

    // ==========================================================
    //  ✅ تست‌های جدید: GET_FOLLOWERS
    // ==========================================================
    describe('GET_FOLLOWERS query', () => {
        it('should have correct structure', () => {
            expect(GET_FOLLOWERS).toBeDefined();
            expect(GET_FOLLOWERS.kind).toBe('Document');
            expect(GET_FOLLOWERS.definitions.length).toBeGreaterThan(0);
        });

        it('should be named "GetFollowers"', () => {
            const definition = findOperation(GET_FOLLOWERS.definitions, 'GetFollowers');
            expect(definition).toBeDefined();
            expect(definition?.operation).toBe('query');
        });

        it('should have userId, searchTerm, limit and offset variables', () => {
            const definition = findOperation(GET_FOLLOWERS.definitions, 'GetFollowers');
            expect(definition).toBeDefined();

            const variableNames = getVariableNames(definition!);
            expect(variableNames).toContain('userId');
            expect(variableNames).toContain('searchTerm');
            expect(variableNames).toContain('limit');
            expect(variableNames).toContain('offset');
            expect(variableNames).toHaveLength(4);
        });

        it('top-level field should be "getFollowers"', () => {
            const definition = findOperation(GET_FOLLOWERS.definitions, 'GetFollowers');
            expect(definition).toBeDefined();

            const fieldNames = getFieldNames(definition!);
            expect(fieldNames).toContain('getFollowers');
        });

        it('should request users, totalCount and hasMore', () => {
            const definition = findOperation(GET_FOLLOWERS.definitions, 'GetFollowers');
            expect(definition).toBeDefined();

            const fieldNames = getNestedFieldNames(definition!, 'getFollowers');
            expect(fieldNames).toContain('users');
            expect(fieldNames).toContain('totalCount');
            expect(fieldNames).toContain('hasMore');
        });

        it('should request correct nested user fields including isFollowing', () => {
            const definition = findOperation(GET_FOLLOWERS.definitions, 'GetFollowers');
            expect(definition).toBeDefined();

            const userFieldNames = getDeeplyNestedFieldNames(definition!, 'getFollowers', 'users');
            expect(userFieldNames).toContain('id');
            expect(userFieldNames).toContain('username');
            expect(userFieldNames).toContain('fullName');
            expect(userFieldNames).toContain('avatar');
            expect(userFieldNames).toContain('isFollowing');
        });
    });

    // ==========================================================
    //  ✅ تست‌های جدید: GET_FOLLOWING
    // ==========================================================
    describe('GET_FOLLOWING query', () => {
        it('should have correct structure', () => {
            expect(GET_FOLLOWING).toBeDefined();
            expect(GET_FOLLOWING.kind).toBe('Document');
            expect(GET_FOLLOWING.definitions.length).toBeGreaterThan(0);
        });

        it('should be named "GetFollowing"', () => {
            const definition = findOperation(GET_FOLLOWING.definitions, 'GetFollowing');
            expect(definition).toBeDefined();
            expect(definition?.operation).toBe('query');
        });

        it('should have userId, searchTerm, limit and offset variables', () => {
            const definition = findOperation(GET_FOLLOWING.definitions, 'GetFollowing');
            expect(definition).toBeDefined();

            const variableNames = getVariableNames(definition!);
            expect(variableNames).toContain('userId');
            expect(variableNames).toContain('searchTerm');
            expect(variableNames).toContain('limit');
            expect(variableNames).toContain('offset');
            expect(variableNames).toHaveLength(4);
        });

        it('top-level field should be "getFollowing"', () => {
            const definition = findOperation(GET_FOLLOWING.definitions, 'GetFollowing');
            expect(definition).toBeDefined();

            const fieldNames = getFieldNames(definition!);
            expect(fieldNames).toContain('getFollowing');
        });

        it('should request users, totalCount and hasMore', () => {
            const definition = findOperation(GET_FOLLOWING.definitions, 'GetFollowing');
            expect(definition).toBeDefined();

            const fieldNames = getNestedFieldNames(definition!, 'getFollowing');
            expect(fieldNames).toContain('users');
            expect(fieldNames).toContain('totalCount');
            expect(fieldNames).toContain('hasMore');
        });

        it('should request correct nested user fields including isFollowing', () => {
            const definition = findOperation(GET_FOLLOWING.definitions, 'GetFollowing');
            expect(definition).toBeDefined();

            const userFieldNames = getDeeplyNestedFieldNames(definition!, 'getFollowing', 'users');
            expect(userFieldNames).toContain('id');
            expect(userFieldNames).toContain('username');
            expect(userFieldNames).toContain('fullName');
            expect(userFieldNames).toContain('avatar');
            expect(userFieldNames).toContain('isFollowing');
        });
    });
});