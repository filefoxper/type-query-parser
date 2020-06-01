import {parse, Parsers} from '../src';
import {endOfDay, getTime, startOfDay, toDatetimeString} from "../src/libs";

describe('parse', () => {

    type Data = {
        id: number,
        name: string,
        active: boolean,
        role: 'GUEST' | 'USER' | 'MASTER' | 'ADMIN'
    }

    const source = {
        id: '123456',
        name: 'jimmy ',
        active: 'true',
        role: 'MASTER'
    };

    test('stringify before equals parse after', () => {

        const template = {
            id: Parsers.natural(),
            name: Parsers.string(),
            active: Parsers.boolean(),
            role: Parsers.enum(['GUEST', 'USER', 'MASTER', 'ADMIN'])
        };

        const target = parse<Data>(source, template);

        expect(target).toEqual({
            id: 123456,
            name: 'jimmy ',
            active: true,
            role: 'MASTER'
        });
    });

    test('omit property "role"', () => {
        const template = {
            id: Parsers.natural(),
            name: Parsers.string(true),
            active: Parsers.boolean()
        };

        const target = <Data>parse(source, template);

        expect(target.role).toBeUndefined();
    });

    test('with defaults', () => {

        const template = {
            id: Parsers.natural(),
            name: Parsers.string(true),
            active: Parsers.boolean(),
            role: Parsers.enum(['GUEST', 'USER'])
        };

        const defaults = {
            role: 'GUEST'
        };

        const target = <Data>parse(source, template, defaults);

        expect(target.role).toBe(defaults.role);
    });

});

describe("Parsers", () => {

    test('Parsers.string', () => {

        type NameQuery = { name: string };

        const query: NameQuery = {
            name: ' jimmy '
        };
        //with out trim
        expect(parse<NameQuery>(query, {name: Parsers.string()}).name).toBe(query.name);
        //with trim
        expect(parse<NameQuery>(query, {name: Parsers.string(true)}).name).toBe(query.name.trim());
    });

    test('Parsers.number', () => {

        type PriceQuery = { price: number };

        const query = {
            price: '12.34'
        };

        expect(parse<PriceQuery>(query, {price: Parsers.number()}).price).toBe(12.34);
    });

    test('Parsers.natural', () => {
        type IdPriceQuery = { id: number, price: number };

        const query = {
            id: '123456',
            price: '12.34'
        };

        //price is not a natural number
        expect(parse<IdPriceQuery>(query,  {price: Parsers.natural()}).price).toBeUndefined();
        //id is a natural number
        expect(parse<IdPriceQuery>(query,  {id: Parsers.natural()}).id).toBe(Number(query.id));
    });

    test('Parsers.integer', () => {
        type Integer = { count: number };

        const query = {
            count: '-2'
        };

        const naturalTemplate = {
            count: Parsers.natural()
        };
        //count is not a natural number
        expect(parse<Integer>(query, naturalTemplate).count).toBeUndefined();

        const integerTemplate = {
            count: Parsers.integer()
        };
        //count is a integer number
        expect(parse<Integer>(query, integerTemplate).count).toBe(-2);
    });

    test('Parsers.boolean', () => {
        type Boolean = { active: boolean };

        const query = {
            active: 'false'
        };

        const template = {
            active: Parsers.boolean()
        };
        expect(parse<Boolean>(query, template).active).toBe(false);
    });

    test('Parsers.enum', () => {
        type Role = { role: string };

        const query = {
            role: 'MASTER'
        };

        const template = {
            role: Parsers.enum(['GUEST', 'USER', 'MASTER', 'ADMIN'])
        };
        expect(parse<Role>(query, template).role).toBe('MASTER');

        type SourcePageSize = { pageSize: string };

        type PageSize = { pageSize: number };

        const pageSizeQuery: SourcePageSize = {pageSize: '10'};

        const pageSizeTemplate = {
            pageSize: Parsers.enum([10, 20, 30])
        };

        expect(parse<PageSize>(pageSizeQuery, pageSizeTemplate).pageSize).toBe(10);
    });

    test('Parses.array', () => {
        type Query = { array: Array<number> };
        const array: Array<string> = ['1', '2', '3'];
        const query = {
            array
        };
        const template = {
            array: Parsers.array(Parsers.natural())
        };
        expect(parse<Query>(query, template).array).toEqual([1, 2, 3]);
        expect(parse<Query>({array:'1,2,3'}, template).array).toEqual([1, 2, 3]);
    });

    test('Parsers.date', () => {
        type Query = { start: string, end: string };
        const query = {
            start: '2020/01/11 11:11:11',
            end: new Date('2020/12/11 11:11:11').getTime().toString()
        };
        const template = {
            start: Parsers.date(startOfDay, toDatetimeString),
            end: Parsers.date(endOfDay, toDatetimeString)
        };
        expect(parse<Query>(query, template).start).toBe('2020-01-11 00:00:00');
        expect(parse<Query>(query, template).end).toBe('2020-12-11 23:59:59');
    });

    test('Parsers.regExp', () => {
        type Query = { reg: string };
        const query = {
            reg: '<abc>'
        };
        const template = {
            reg: Parsers.regExp(/\<.*\>/)
        };
        expect(parse<Query>(query, template).reg).toBe('<abc>');
    });

});