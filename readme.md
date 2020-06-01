[npm link](https://www.npmjs.com/package/type-query-parser) & [github link](https://github.com/filefoxper/type-query-parser)
# problem
When we parse a search from location, we often get an object like ```{[key: string]: string|string[]|undefined}```, 
but we really want an object like ```{[key:string]:number|boolean|Date|string|string[]...} ``` which can describe more 
types about the values. Also we want to validate these values, if they are invalid we can replace them from an default.

# resolve
Here is a tool ```type-query-parser``` which can do something like transforming value type and replacing value which is invalid.
 It parses query with your template.

# example (more in [test](https://github.com/filefoxper/type-query-parser/blob/master/test/index.test.ts))
basic usage
```js
    import {parse,Parsers} from 'type-query-parser';

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

        const target = parse(source, template);

        expect(target).toEqual({
            id: 123456,
            name: 'jimmy ',
            active: true,
            role: 'MASTER'
        });
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

        const target = parse(source, template, defaults);

        expect(target.role).toBe(defaults.role);
    });
```
string parser
```js
    import {parse,Parsers} from 'type-query-parser';

    test('Parsers.string', () => {

        const query = {
            name: ' jimmy '
        };
        //with out trim
        expect(parse(query, {name: Parsers.string()}).name).toBe(query.name);
        //with trim
        expect(parse(query, {name: Parsers.string(true)}).name).toBe(query.name.trim());
    });
```
number parser
```js
    import {parse,Parsers} from 'type-query-parser';

    test('Parsers.number', () => {

        const query = {
            price: '12.34'
        };

        expect(parse(query, {price: Parsers.number()}).price).toBe(12.34);
    });
```
# api
<strong>parse</strong> `query` to an object you want by `template` and `defaults` in `opt`.

types:

type Parser = (value?: string|string[]) => any|void;
`any function matches Parser is used to transform value to you want`

type Template = {
    [key: string]: Template | Parser
} | Parser[];
`any object matches Template is used to structure result you want`

type {defaults?:any} 
`the default value you provide, when the value is undefined, the value in defaults with same key will replace the undefined one.`
```js
function parse(search:string,template?:Template,defaults?: any)
```
<strong>Parsers</strong> provide some `Parser`, which is helpful, also you can write yourself Parsers.

<strong>Parsers.number:</strong>
```
function Parsers.number() return a Parser
 
Parser:(value?:string)=>number|undefined

if the value isNaN (can not be a number), it will return an undefined value, 
else it will provide a number value (typeof returnValue==='number').
```

<strong>Parsers.natural:</strong>
```
function Parsers.natural() return a Parser
 
Parser:(value?:string)=>number|undefined

if the value can not be a natural number, it will return an undefined value, 
else it will provide a natural number value (typeof returnValue==='number').
```

<strong>Parsers.integer:</strong>
```
function Parsers.natural() return a Parser
 
Parser:(value?:string)=>number|undefined

if the value can not be a integer, it will return an undefined value, 
else it will provide a integer value (typeof returnValue==='number').
```

<strong>Parsers.string:</strong>
```
function Parsers.string(trim:boolean) return a Parser
 
Parser:(value?:string)=>string

the value will be a string, if you set trim:true the string value will be trimmed.
```

<strong>Parsers.boolean:</strong>
```
function Parsers.boolean() return a Parser
 
Parser:(value?:string)=>boolean|undefined

if the value trimmed is not 'true' or 'false', it will return an undefined value, 
else it will provide a boolean value (typeof returnValue==='boolean').
```

<strong>Parsers.enum:</strong>
```
function Parsers.enum(array:Array<any>) return a Parser
 
Parser:(value?:string)=>any|undefined

if the value trimmed is not included in array, it will return an undefined value, 
else it will return the one in array which matches value by '==' not '==='.
```

<strong>Parsers.array:</strong>
```
function Parsers.array(mapper?: (data: string) => any) return a Parser
 
Parser: (value?: string | Array<string>)=>Array<any>|Array<string>

if the value is string, it will transform to array by string.split, then the array will map with mapper, 
at last the mapped array will filter out the datas to a new array which data is not undefined.
```

<strong>Parsers.regExp:</strong>
```
function Parsers.regExp(regExp: RegExp) return a Parser
 
Parser:(value?:string)=>string|undefined

if the value 'regExp.test(value)' is passed, it will return value, else it will undefined.
```

<strong>Parsers.date:</strong>
```
function Parsers.date(...dateLikeReduces: Array<DateLikeReduce>) return a Parser
 
Parser:(value?:string)=>DateLike|undefined

type DateLike = string | number | Date;

type DateLikeReduce = (dateLike: DateLike) => DateLike

if the value trimmed can be a Date value, it will return a DateLike value, 
which might be produced by dateLikeReduces, else it will return undefined.

here is some dateLikeReduces provided, they can help you use it more quickly:

startOfDay(dateLike: DateLike)=>Date                // DateLike[2020-05-23 12:11:34] => new Date(2020-05-23 00:00:00:000)
endOfDay(dateLike: DateLike)=>Date                  // DateLike[2020-05-23 12:11:34] => new Date(2020-05-23 23:59:59:999)
toDateString(date: DateLike)=>string                // DateLike[2020-05-23 12:11:34] => '2020-05-23'
toDatetimeString(date: DateLike)=>string            // DateLike[2020-05-23 12:11:34] => '2020-05-23 12:11:34'
pattern(pat: string)=>formatDateLike(dateLike: DateLike)=>string
                                                    // pattern('YYYY-MM-DD HH:mm')=>formatter
                                                    // formatter(DateLike[2020-05-23 12:11:34])
                                                    // =>'2020-05-23 12:11'
                                                    
we can use like this:
import {parse,Parsers} from 'type-query-parser';
import {startOfDay,pattern} from 'type-query-parser/libs';

const template={
    start:Parsers.date(startOfDay,pattern('YYYY-MM-DD HH:mm:ss')),
    end:Parsers.date(endOfDay,toDatetimeString)
};

const data=parse({start:'2020-01-01 11:02:30',end:'2020-12-13 20:02:15'},template);

/*** result ***/
{
    start:'2020-01-01 00:00:00',
    end:'2020-12-13 23:59:59'
}
```

<strong>Parsers.datePattern:</strong>
```
function Parsers.datePattern(...dateLikeReduces: Array<DateLikeReduce>) return a Parser
 
Parser:(value?:string)=>string|undefined

it is just a wrap on Parsers.date, and returns a 'YYYY-MM-DD' formatted string value or undefined.
```

<strong>Parsers.datetimePattern:</strong>
```
function Parsers.datetimePattern(...dateLikeReduces: Array<DateLikeReduce>) return a Parser
 
Parser:(value?:string)=>string|undefined

it is just a wrap on Parsers.date, and returns a 'YYYY-MM-DD HH:mm:ss' formatted string value or undefined.
```

# summary
if you like this tool, give me a little start, thank you.
