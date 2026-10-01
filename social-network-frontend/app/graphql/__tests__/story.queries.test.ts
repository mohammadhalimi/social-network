// src/app/graphql/__tests__/story.queries.test.ts

import {
    CREATE_STORY,
    DELETE_STORY,
    VIEW_STORY,
    GET_USER_STORIES,
    GET_FOLLOWING_STORIES,
    GET_CLOSE_FRIENDS,
    ADD_CLOSE_FRIEND,
    REMOVE_CLOSE_FRIEND,
} from '../story.queries';

import {
    DefinitionNode,
    OperationDefinitionNode,
    FieldNode,
    SelectionSetNode,
} from 'graphql';

// ✅ پیدا کردن OperationDefinition با نام
const findOperation = (
    definitions: readonly DefinitionNode[],
    operationName: string
): OperationDefinitionNode | undefined => {
    return definitions.find(
        (def): def is OperationDefinitionNode =>
            def.kind === 'OperationDefinition' && def.name?.value === operationName
    );
};

// ✅ گرفتن نام فیلدها از selectionSet
const getFieldNamesFromSelectionSet = (selectionSet: SelectionSetNode): string[] => {
    const fields: string[] = [];
    selectionSet.selections.forEach((selection) => {
        if (selection.kind === 'Field') {
            fields.push((selection as FieldNode).name.value);
        }
    });
    return fields;
};

const getFieldNames = (definition: OperationDefinitionNode): string[] => {
    return definition.selectionSet
        ? getFieldNamesFromSelectionSet(definition.selectionSet)
        : [];
};

const getNestedFieldNames = (
    definition: OperationDefinitionNode,
    parentFieldName: string
): string[] => {
    const selectionSet = definition.selectionSet;
    if (!selectionSet) return [];
    const parentField = selectionSet.selections.find(
        (s): s is FieldNode => s.kind === 'Field' && s.name.value === parentFieldName
    );
    return parentField?.selectionSet
        ? getFieldNamesFromSelectionSet(parentField.selectionSet)
        : [];
};

const getDeeplyNestedFieldNames = (
    definition: OperationDefinitionNode,
    parentFieldName: string,
    childFieldName: string
): string[] => {
    const selectionSet = definition.selectionSet;
    if (!selectionSet) return [];
    const parentField = selectionSet.selections.find(
        (s): s is FieldNode => s.kind === 'Field' && s.name.value === parentFieldName
    );
    if (!parentField?.selectionSet) return [];
    const childField = parentField.selectionSet.selections.find(
        (s): s is FieldNode => s.kind === 'Field' && s.name.value === childFieldName
    );
    return childField?.selectionSet
        ? getFieldNamesFromSelectionSet(childField.selectionSet)
        : [];
};

const getVariableNames = (definition: OperationDefinitionNode): string[] => {
    return (definition.variableDefinitions || []).map(
        (v: any) => v.variable.name.value
    );
};

describe('Story Queries', () => {
    // ==========================================================
    //  CREATE_STORY
    // ==========================================================
    describe('CREATE_STORY', () => {
        it('should have correct structure', () => {
            expect(CREATE_STORY).toBeDefined();
            expect(CREATE_STORY.kind).toBe('Document');
            expect(CREATE_STORY.definitions.length).toBeGreaterThan(0);
        });

        it('should be a mutation named "CreateStory"', () => {
            const def = findOperation(CREATE_STORY.definitions, 'CreateStory');
            expect(def).toBeDefined();
            expect(def?.operation).toBe('mutation');
        });

        it('should have mediaUrl, mediaType, duration, visibility variables', () => {
            const def = findOperation(CREATE_STORY.definitions, 'CreateStory');
            const vars = getVariableNames(def!);
            expect(vars).toContain('mediaUrl');
            expect(vars).toContain('mediaType');
            expect(vars).toContain('duration');
            expect(vars).toContain('visibility');
            expect(vars).toHaveLength(4);
        });

        it('top-level field should be "createStory"', () => {
            const def = findOperation(CREATE_STORY.definitions, 'CreateStory');
            expect(getFieldNames(def!)).toContain('createStory');
        });

        it('should request success, message and story', () => {
            const def = findOperation(CREATE_STORY.definitions, 'CreateStory');
            const fields = getNestedFieldNames(def!, 'createStory');
            expect(fields).toContain('success');
            expect(fields).toContain('message');
            expect(fields).toContain('story');
        });

        it('should request nested story fields with user', () => {
            const def = findOperation(CREATE_STORY.definitions, 'CreateStory');
            const fields = getDeeplyNestedFieldNames(def!, 'createStory', 'story');
            expect(fields).toContain('id');
            expect(fields).toContain('mediaUrl');
            expect(fields).toContain('mediaType');
            expect(fields).toContain('visibility');
            expect(fields).toContain('createdAt');
            expect(fields).toContain('expiresAt');
            expect(fields).toContain('viewsCount');
            expect(fields).toContain('isViewedByMe');
            expect(fields).toContain('user');
        });
    });

    // ==========================================================
    //  DELETE_STORY
    // ==========================================================
    describe('DELETE_STORY', () => {
        it('should have correct structure', () => {
            expect(DELETE_STORY).toBeDefined();
            expect(DELETE_STORY.kind).toBe('Document');
        });

        it('should be a mutation named "DeleteStory"', () => {
            const def = findOperation(DELETE_STORY.definitions, 'DeleteStory');
            expect(def).toBeDefined();
            expect(def?.operation).toBe('mutation');
        });

        it('should have storyId variable', () => {
            const def = findOperation(DELETE_STORY.definitions, 'DeleteStory');
            const vars = getVariableNames(def!);
            expect(vars).toEqual(['storyId']);
        });

        it('should request success and message', () => {
            const def = findOperation(DELETE_STORY.definitions, 'DeleteStory');
            const fields = getNestedFieldNames(def!, 'deleteStory');
            expect(fields).toContain('success');
            expect(fields).toContain('message');
        });
    });

    // ==========================================================
    //  VIEW_STORY
    // ==========================================================
    describe('VIEW_STORY', () => {
        it('should have correct structure', () => {
            expect(VIEW_STORY).toBeDefined();
            expect(VIEW_STORY.kind).toBe('Document');
        });

        it('should be a mutation named "ViewStory"', () => {
            const def = findOperation(VIEW_STORY.definitions, 'ViewStory');
            expect(def?.operation).toBe('mutation');
        });

        it('should have storyId variable', () => {
            const def = findOperation(VIEW_STORY.definitions, 'ViewStory');
            expect(getVariableNames(def!)).toEqual(['storyId']);
        });

        it('should request success and message', () => {
            const def = findOperation(VIEW_STORY.definitions, 'ViewStory');
            const fields = getNestedFieldNames(def!, 'viewStory');
            expect(fields).toContain('success');
            expect(fields).toContain('message');
        });
    });

    // ==========================================================
    //  GET_USER_STORIES
    // ==========================================================
    describe('GET_USER_STORIES', () => {
        it('should have correct structure', () => {
            expect(GET_USER_STORIES).toBeDefined();
            expect(GET_USER_STORIES.kind).toBe('Document');
        });

        it('should be a query named "GetUserStories"', () => {
            const def = findOperation(GET_USER_STORIES.definitions, 'GetUserStories');
            expect(def?.operation).toBe('query');
        });

        it('should have userId variable', () => {
            const def = findOperation(GET_USER_STORIES.definitions, 'GetUserStories');
            expect(getVariableNames(def!)).toEqual(['userId']);
        });

        it('top-level field should be "getUserStories"', () => {
            const def = findOperation(GET_USER_STORIES.definitions, 'GetUserStories');
            expect(getFieldNames(def!)).toContain('getUserStories');
        });

        it('should request all story fields including viewers', () => {
            const def = findOperation(GET_USER_STORIES.definitions, 'GetUserStories');
            const fields = getNestedFieldNames(def!, 'getUserStories');
            expect(fields).toContain('id');
            expect(fields).toContain('mediaUrl');
            expect(fields).toContain('mediaType');
            expect(fields).toContain('visibility');
            expect(fields).toContain('createdAt');
            expect(fields).toContain('expiresAt');
            expect(fields).toContain('viewsCount');
            expect(fields).toContain('isViewedByMe');
            expect(fields).toContain('user');
            expect(fields).toContain('viewers');
        });

        it('should request nested viewers fields', () => {
            const def = findOperation(GET_USER_STORIES.definitions, 'GetUserStories');
            const fields = getDeeplyNestedFieldNames(def!, 'getUserStories', 'viewers');
            expect(fields).toContain('viewedAt');
            expect(fields).toContain('user');
        });
    });

    // ==========================================================
    //  GET_FOLLOWING_STORIES
    // ==========================================================
    describe('GET_FOLLOWING_STORIES', () => {
        it('should have correct structure', () => {
            expect(GET_FOLLOWING_STORIES).toBeDefined();
            expect(GET_FOLLOWING_STORIES.kind).toBe('Document');
        });

        it('should be a query named "GetFollowingStories"', () => {
            const def = findOperation(GET_FOLLOWING_STORIES.definitions, 'GetFollowingStories');
            expect(def?.operation).toBe('query');
        });

        it('should not have variables', () => {
            const def = findOperation(GET_FOLLOWING_STORIES.definitions, 'GetFollowingStories');
            expect(def?.variableDefinitions || []).toHaveLength(0);
        });

        it('should request story fields without viewers', () => {
            const def = findOperation(GET_FOLLOWING_STORIES.definitions, 'GetFollowingStories');
            const fields = getNestedFieldNames(def!, 'getFollowingStories');
            expect(fields).toContain('id');
            expect(fields).toContain('mediaUrl');
            expect(fields).toContain('viewsCount');
            expect(fields).toContain('isViewedByMe');
            expect(fields).toContain('user');
            // ✅ viewers نباید باشه
            expect(fields).not.toContain('viewers');
        });
    });

    // ==========================================================
    //  GET_CLOSE_FRIENDS
    // ==========================================================
    describe('GET_CLOSE_FRIENDS', () => {
        it('should have correct structure', () => {
            expect(GET_CLOSE_FRIENDS).toBeDefined();
            expect(GET_CLOSE_FRIENDS.kind).toBe('Document');
        });

        it('should be a query named "GetCloseFriends"', () => {
            const def = findOperation(GET_CLOSE_FRIENDS.definitions, 'GetCloseFriends');
            expect(def?.operation).toBe('query');
        });

        it('should request user fields', () => {
            const def = findOperation(GET_CLOSE_FRIENDS.definitions, 'GetCloseFriends');
            const fields = getNestedFieldNames(def!, 'getCloseFriends');
            expect(fields).toContain('id');
            expect(fields).toContain('username');
            expect(fields).toContain('fullName');
            expect(fields).toContain('avatar');
        });
    });

    // ==========================================================
    //  ADD_CLOSE_FRIEND
    // ==========================================================
    describe('ADD_CLOSE_FRIEND', () => {
        it('should have correct structure', () => {
            expect(ADD_CLOSE_FRIEND).toBeDefined();
            expect(ADD_CLOSE_FRIEND.kind).toBe('Document');
        });

        it('should be a mutation named "AddCloseFriend"', () => {
            const def = findOperation(ADD_CLOSE_FRIEND.definitions, 'AddCloseFriend');
            expect(def?.operation).toBe('mutation');
        });

        it('should have userId variable', () => {
            const def = findOperation(ADD_CLOSE_FRIEND.definitions, 'AddCloseFriend');
            expect(getVariableNames(def!)).toEqual(['userId']);
        });

        it('should request success, message and closeFriends', () => {
            const def = findOperation(ADD_CLOSE_FRIEND.definitions, 'AddCloseFriend');
            const fields = getNestedFieldNames(def!, 'addCloseFriend');
            expect(fields).toContain('success');
            expect(fields).toContain('message');
            expect(fields).toContain('closeFriends');
        });
    });

    // ==========================================================
    //  REMOVE_CLOSE_FRIEND
    // ==========================================================
    describe('REMOVE_CLOSE_FRIEND', () => {
        it('should have correct structure', () => {
            expect(REMOVE_CLOSE_FRIEND).toBeDefined();
            expect(REMOVE_CLOSE_FRIEND.kind).toBe('Document');
        });

        it('should be a mutation named "RemoveCloseFriend"', () => {
            const def = findOperation(REMOVE_CLOSE_FRIEND.definitions, 'RemoveCloseFriend');
            expect(def?.operation).toBe('mutation');
        });

        it('should have userId variable', () => {
            const def = findOperation(REMOVE_CLOSE_FRIEND.definitions, 'RemoveCloseFriend');
            expect(getVariableNames(def!)).toEqual(['userId']);
        });

        it('should request success, message and closeFriends', () => {
            const def = findOperation(REMOVE_CLOSE_FRIEND.definitions, 'RemoveCloseFriend');
            const fields = getNestedFieldNames(def!, 'removeCloseFriend');
            expect(fields).toContain('success');
            expect(fields).toContain('message');
            expect(fields).toContain('closeFriends');
        });
    });
});