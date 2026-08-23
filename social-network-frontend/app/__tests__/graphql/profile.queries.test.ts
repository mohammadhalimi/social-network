import {
    GET_PROFILE,
    UPDATE_PROFILE,
    CHANGE_PASSWORD
} from '../../graphql/profile.queries';
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

// ✅ تابع کمکی برای گرفتن نام فیلدهای سطح بالا از عملیات (مثلاً "me", "updateProfile", "changePassword") 
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

// ✅ تابع کمکی برای گرفتن نام متغیرها 
const getVariableNames = (definition: OperationDefinitionNode): string[] => {
    const variableDefs = definition.variableDefinitions || [];
    return variableDefs.map((v: any) => v.variable.name.value);
};

describe('Profile Queries', () => {
    // ========================================================== 
    //  تست‌های GET_PROFILE 
    // ========================================================== 
    it('should have correct GET_PROFILE query structure', () => {
        expect(GET_PROFILE).toBeDefined();
        expect(GET_PROFILE.kind).toBe('Document');
        expect(GET_PROFILE.definitions).toBeDefined();
        expect(GET_PROFILE.definitions.length).toBeGreaterThan(0);
    });

    it('GET_PROFILE query should be named "GetProfile"', () => {
        const definition = findOperation(GET_PROFILE.definitions, 'GetProfile');
        expect(definition).toBeDefined();
        expect(definition?.name?.value).toBe('GetProfile');
        expect(definition?.operation).toBe('query');
    });

    it('GET_PROFILE query should not have variables', () => {
        const definition = findOperation(GET_PROFILE.definitions, 'GetProfile');
        expect(definition).toBeDefined();

        const variableNames = getVariableNames(definition!);
        expect(variableNames).toHaveLength(0);
    });

    it('GET_PROFILE query top-level field should be "me"', () => {
        const definition = findOperation(GET_PROFILE.definitions, 'GetProfile');
        expect(definition).toBeDefined();

        const fieldNames = getFieldNames(definition!);
        expect(fieldNames).toContain('me');
    });

    it('GET_PROFILE query should request all user fields', () => {
        const definition = findOperation(GET_PROFILE.definitions, 'GetProfile');
        expect(definition).toBeDefined();

        const fieldNames = getNestedFieldNames(definition!, 'me');
        expect(fieldNames).toContain('id');
        expect(fieldNames).toContain('email');
        expect(fieldNames).toContain('username');
        expect(fieldNames).toContain('fullName');
        expect(fieldNames).toContain('bio');
        expect(fieldNames).toContain('avatar');
        expect(fieldNames).toContain('createdAt');
        expect(fieldNames).toContain('updatedAt');
        expect(fieldNames).toHaveLength(8);
    });

    // ========================================================== 
    //  تست‌های UPDATE_PROFILE 
    // ========================================================== 
    it('should have correct UPDATE_PROFILE mutation structure', () => {
        expect(UPDATE_PROFILE).toBeDefined();
        expect(UPDATE_PROFILE.kind).toBe('Document');
        expect(UPDATE_PROFILE.definitions).toBeDefined();
        expect(UPDATE_PROFILE.definitions.length).toBeGreaterThan(0);
    });

    it('UPDATE_PROFILE mutation should be named "UpdateProfile"', () => {
        const definition = findOperation(UPDATE_PROFILE.definitions, 'UpdateProfile');
        expect(definition).toBeDefined();
        expect(definition?.name?.value).toBe('UpdateProfile');
    });

    it('UPDATE_PROFILE mutation should have correct variables', () => {
        const definition = findOperation(UPDATE_PROFILE.definitions, 'UpdateProfile');
        expect(definition).toBeDefined();

        const variableNames = getVariableNames(definition!);
        expect(variableNames).toContain('username');
        expect(variableNames).toContain('fullName');
        expect(variableNames).toContain('email');
        expect(variableNames).toContain('bio');
        expect(variableNames).toContain('avatar');
        expect(variableNames).toHaveLength(5);
    });

    it('UPDATE_PROFILE mutation variables should all be optional (nullable)', () => {
        const definition = findOperation(UPDATE_PROFILE.definitions, 'UpdateProfile');
        expect(definition).toBeDefined();

        const variableDefs = definition!.variableDefinitions || [];
        variableDefs.forEach((v) => {
            // نوع نباید NonNullType باشه (یعنی علامت ! نداشته باشه) 
            expect(v.type.kind).not.toBe('NonNullType');
        });
    });

    it('UPDATE_PROFILE mutation top-level field should be "updateProfile"', () => {
        const definition = findOperation(UPDATE_PROFILE.definitions, 'UpdateProfile');
        expect(definition).toBeDefined();

        const fieldNames = getFieldNames(definition!);
        expect(fieldNames).toContain('updateProfile');
    });

    it('UPDATE_PROFILE mutation should request success, message and user', () => {
        const definition = findOperation(UPDATE_PROFILE.definitions, 'UpdateProfile');
        expect(definition).toBeDefined();

        const fieldNames = getNestedFieldNames(definition!, 'updateProfile');
        expect(fieldNames).toContain('success');
        expect(fieldNames).toContain('message');
        expect(fieldNames).toContain('user');
    });

    it('UPDATE_PROFILE mutation should request all user fields inside "user"', () => {
        const definition = findOperation(UPDATE_PROFILE.definitions, 'UpdateProfile');
        expect(definition).toBeDefined();

        const selectionSet = definition!.selectionSet;
        const updateProfileField = selectionSet.selections.find(
            (s): s is FieldNode => s.kind === 'Field' && s.name.value === 'updateProfile'
        );
        expect(updateProfileField).toBeDefined();

        const userField = updateProfileField!.selectionSet!.selections.find(
            (s): s is FieldNode => s.kind === 'Field' && s.name.value === 'user'
        );
        expect(userField).toBeDefined();

        const userFieldNames = getFieldNamesFromSelectionSet(userField!.selectionSet!);
        expect(userFieldNames).toContain('id');
        expect(userFieldNames).toContain('email');
        expect(userFieldNames).toContain('username');
        expect(userFieldNames).toContain('fullName');
        expect(userFieldNames).toContain('bio');
        expect(userFieldNames).toContain('avatar');
        expect(userFieldNames).toContain('createdAt');
        expect(userFieldNames).toContain('updatedAt');
    });

    // ========================================================== 
    //  تست‌های CHANGE_PASSWORD 
    // ========================================================== 
    it('should have correct CHANGE_PASSWORD mutation structure', () => {
        expect(CHANGE_PASSWORD).toBeDefined();
        expect(CHANGE_PASSWORD.kind).toBe('Document');
        expect(CHANGE_PASSWORD.definitions).toBeDefined();
        expect(CHANGE_PASSWORD.definitions.length).toBeGreaterThan(0);
    });

    it('CHANGE_PASSWORD mutation should be named "ChangePassword"', () => {
        const definition = findOperation(CHANGE_PASSWORD.definitions, 'ChangePassword');
        expect(definition).toBeDefined();
        expect(definition?.name?.value).toBe('ChangePassword');
    });

    it('CHANGE_PASSWORD mutation should have correct variables', () => {
        const definition = findOperation(CHANGE_PASSWORD.definitions, 'ChangePassword');
        expect(definition).toBeDefined();

        const variableNames = getVariableNames(definition!);
        expect(variableNames).toContain('oldPassword');
        expect(variableNames).toContain('newPassword');
        expect(variableNames).toHaveLength(2);
    });

    it('CHANGE_PASSWORD mutation variables should be required (non-nullable)', () => {
        const definition = findOperation(CHANGE_PASSWORD.definitions, 'ChangePassword');
        expect(definition).toBeDefined();

        const variableDefs = definition!.variableDefinitions || [];
        expect(variableDefs.length).toBe(2);
        variableDefs.forEach((v) => {
            expect(v.type.kind).toBe('NonNullType');
        });
    });

    it('CHANGE_PASSWORD mutation top-level field should be "changePassword"', () => {
        const definition = findOperation(CHANGE_PASSWORD.definitions, 'ChangePassword');
        expect(definition).toBeDefined();

        const fieldNames = getFieldNames(definition!);
        expect(fieldNames).toContain('changePassword');
    });

    it('CHANGE_PASSWORD mutation should request success, message and user', () => {
        const definition = findOperation(CHANGE_PASSWORD.definitions, 'ChangePassword');
        expect(definition).toBeDefined();

        const fieldNames = getNestedFieldNames(definition!, 'changePassword');
        expect(fieldNames).toContain('success');
        expect(fieldNames).toContain('message');
        expect(fieldNames).toContain('user');
    });
});