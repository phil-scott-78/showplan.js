import { MissingIndex, ColumnGroup, Column } from '@/parser/showplan';

describe('missing index', () => {
    test('can create create simple statement', () => {
        const column = new Column(0, 'Id');
        const columnGroup = new ColumnGroup('EQUALITY', [column]);
        const missingIndex = new MissingIndex('myDatabase', 'dbo', 'tableName', [columnGroup]);
        const expectedSql = 'CREATE NONCLUSTERED INDEX IX_tableName_Id ON dbo.tableName (Id)';
        expect(missingIndex.toCreateIndexString()).toBe(expectedSql);
    });

    test('can create create simple statement with multiple columns', () => {
        const column = new Column(0, 'Id');
        const column2 = new Column(0, 'LastName');
        const columnGroup = new ColumnGroup('EQUALITY', [column, column2]);
        const missingIndex = new MissingIndex('myDatabase', 'dbo', 'tableName', [columnGroup]);
        const expectedSql = 'CREATE NONCLUSTERED INDEX IX_tableName_Id_LastName ON dbo.tableName (Id, LastName)';
        expect(missingIndex.toCreateIndexString()).toBe(expectedSql);
    });

    test(
        'can create create simple statement with multiple columns and an include statement',
        () => {
            const column = new Column(0, 'Id');
            const column2 = new Column(1, 'LastName');
            const columnGroup = new ColumnGroup('EQUALITY', [column, column2]);

            const includeColumn = new Column(0, 'FirstName');
            const includeColumnGroup = new ColumnGroup('INCLUDE', [includeColumn]);
            const missingIndex = new MissingIndex('myDatabase', 'dbo', 'tableName', [columnGroup, includeColumnGroup]);
            const expectedSql = 'CREATE NONCLUSTERED INDEX IX_tableName_Id_LastName ON dbo.tableName (Id, LastName) INCLUDE (FirstName)';
            expect(missingIndex.toCreateIndexString()).toBe(expectedSql);
        }
    );
});
