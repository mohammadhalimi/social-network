import { REGISTER, LOGIN, LOGOUT } from '../../graphql/auth.queries'; 
import { DefinitionNode, OperationDefinitionNode, FieldNode, SelectionSetNode } from 'graphql'; 

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

// ✅ تابع کمکی برای گرفتن نام فیلدهای سطح بالا از عملیات (مثلاً "register", "login", "logout") 
const getFieldNames = (definition: OperationDefinitionNode): string[] => { 
    const selectionSet = definition.selectionSet; 
    if (!selectionSet) return []; 
    return getFieldNamesFromSelectionSet(selectionSet); 
}; 

// ✅ تابع کمکی برای گرفتن نام فیلدهای تو در توی یک فیلد خاص 
// مثلاً فیلدهای داخل "register { success message user token }" 
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

describe('Auth Queries', () => { 
    // ========================================================== 
    //  تست‌های REGISTER 
    // ========================================================== 
    it('should have correct REGISTER mutation structure', () => { 
        expect(REGISTER).toBeDefined(); 
        expect(REGISTER.kind).toBe('Document'); 
        expect(REGISTER.definitions).toBeDefined(); 
        expect(REGISTER.definitions.length).toBeGreaterThan(0); 
    }); 

    it('REGISTER mutation should be named "Register"', () => { 
        const definition = findOperation(REGISTER.definitions, 'Register'); 
        expect(definition).toBeDefined(); 
        expect(definition?.name?.value).toBe('Register'); 
    }); 

    it('REGISTER mutation should have correct variables', () => { 
        const definition = findOperation(REGISTER.definitions, 'Register'); 
        expect(definition).toBeDefined(); 
         
        const variableNames = getVariableNames(definition!); 
        expect(variableNames).toContain('email'); 
        expect(variableNames).toContain('username'); 
        expect(variableNames).toContain('password'); 
        expect(variableNames).toContain('fullName'); 
        expect(variableNames).toHaveLength(4); 
    }); 

    it('REGISTER mutation top-level field should be "register"', () => { 
        const definition = findOperation(REGISTER.definitions, 'Register'); 
        expect(definition).toBeDefined(); 

        const fieldNames = getFieldNames(definition!); 
        expect(fieldNames).toContain('register'); 
    }); 

    it('REGISTER mutation should request success, message, user and token', () => { 
        const definition = findOperation(REGISTER.definitions, 'Register'); 
        expect(definition).toBeDefined(); 
         
        const fieldNames = getNestedFieldNames(definition!, 'register'); 
        expect(fieldNames).toContain('success'); 
        expect(fieldNames).toContain('message'); 
        expect(fieldNames).toContain('user'); 
        expect(fieldNames).toContain('token'); 
    }); 

    // ========================================================== 
    //  تست‌های LOGIN 
    // ========================================================== 
    it('should have correct LOGIN mutation structure', () => { 
        expect(LOGIN).toBeDefined(); 
        expect(LOGIN.kind).toBe('Document'); 
        expect(LOGIN.definitions).toBeDefined(); 
        expect(LOGIN.definitions.length).toBeGreaterThan(0); 
    }); 

    it('LOGIN mutation should be named "Login"', () => { 
        const definition = findOperation(LOGIN.definitions, 'Login'); 
        expect(definition).toBeDefined(); 
        expect(definition?.name?.value).toBe('Login'); 
    }); 

    it('LOGIN mutation should have correct variables', () => { 
        const definition = findOperation(LOGIN.definitions, 'Login'); 
        expect(definition).toBeDefined(); 
         
        const variableNames = getVariableNames(definition!); 
        expect(variableNames).toContain('email'); 
        expect(variableNames).toContain('password'); 
        expect(variableNames).toHaveLength(2); 
    }); 

    it('LOGIN mutation top-level field should be "login"', () => { 
        const definition = findOperation(LOGIN.definitions, 'Login'); 
        expect(definition).toBeDefined(); 

        const fieldNames = getFieldNames(definition!); 
        expect(fieldNames).toContain('login'); 
    }); 

    it('LOGIN mutation should request success, message, user and token', () => { 
        const definition = findOperation(LOGIN.definitions, 'Login'); 
        expect(definition).toBeDefined(); 
         
        const fieldNames = getNestedFieldNames(definition!, 'login'); 
        expect(fieldNames).toContain('success'); 
        expect(fieldNames).toContain('message'); 
        expect(fieldNames).toContain('user'); 
        expect(fieldNames).toContain('token'); 
    }); 

    // ========================================================== 
    //  تست‌های LOGOUT 
    // ========================================================== 
    it('should have correct LOGOUT mutation structure', () => { 
        expect(LOGOUT).toBeDefined(); 
        expect(LOGOUT.kind).toBe('Document'); 
        expect(LOGOUT.definitions).toBeDefined(); 
        expect(LOGOUT.definitions.length).toBeGreaterThan(0); 
    }); 

    it('LOGOUT mutation should be named "Logout"', () => { 
        const definition = findOperation(LOGOUT.definitions, 'Logout'); 
        expect(definition).toBeDefined(); 
        expect(definition?.name?.value).toBe('Logout'); 
    }); 

    it('LOGOUT mutation top-level field should be "logout"', () => { 
        const definition = findOperation(LOGOUT.definitions, 'Logout'); 
        expect(definition).toBeDefined(); 

        const fieldNames = getFieldNames(definition!); 
        expect(fieldNames).toContain('logout'); 
    }); 

    it('LOGOUT mutation should request success and message', () => { 
        const definition = findOperation(LOGOUT.definitions, 'Logout'); 
        expect(definition).toBeDefined(); 
         
        const fieldNames = getNestedFieldNames(definition!, 'logout'); 
        expect(fieldNames).toContain('success'); 
        expect(fieldNames).toContain('message'); 
    }); 
});