import {ParsedQs, Template} from "./index.type";
import {compose, couldBeDate, toDate} from "../libs/dates";
import {DateLike, DateLikeReduce} from "../libs/dates.type";
import {toDateString, toDatetimeString} from "../libs";
import {booleanParser, integerParser, naturalParser, numberParser} from "../libs/parser";
import {Parser} from "../libs/parser.type";

export class Parsers {

    static string(trim?: boolean): Parser {
        return function (value?: string): string {
            const data = value || '';
            return trim ? data.trim() : data;
        };
    };

    static number(): Parser {
        return numberParser;
    };

    static boolean(): Parser {
        return booleanParser;
    };

    static array<T>(mapper?: (data: string) => T): Parser {
        return function (value?: string | Array<string>): Array<T> | Array<string> | undefined {
            if (!Array.isArray(value) && typeof value !== 'string') {
                return undefined;
            }
            const array = typeof value === 'string' ? value.split(',') : value;
            if (mapper) {
                return array.map(mapper).filter((d) => d !== undefined);
            }
            return array.filter((d) => d !== undefined);
        }
    }

    static integer(): Parser {
        return integerParser;
    };

    static date(...dateLikeReduces: Array<DateLikeReduce>): Parser {
        return function (value?: string): DateLike | undefined {
            return value && couldBeDate(value) ? compose(...dateLikeReduces)(toDate(value.trim())) : undefined;
        }
    }

    static datePattern<T>(...dateLikeReduces: Array<DateLikeReduce>): Parser {
        const reduce = Parsers.date((dateLike: DateLike) => toDateString(dateLike), ...dateLikeReduces);
        return function (value?: string): string | undefined {
            return reduce(value) as string | undefined;
        }
    };

    static datetimePattern(...dateLikeReduces: Array<DateLikeReduce>): Parser {
        const reduce = Parsers.date((dateLike: DateLike) => toDatetimeString(dateLike), ...dateLikeReduces);
        return function (value?: string): string | undefined {
            return reduce(value) as string | undefined;
        }
    };

    static natural(): Parser {
        return function (value?: string): number | undefined {
            return naturalParser(value);
        }
    };

    static enum(array: Array<any>): Parser {
        return function (value?: string): string | undefined {
            if (value === undefined) {
                return value;
            }
            const valueTrim = value.trim();
            return array.find((data) => data == valueTrim);
        }
    }

    static regExp(regExp: RegExp): Parser {
        return function (value?: string): string | undefined {
            if (value === undefined) {
                return value;
            }
            return regExp.test(value) ? value : undefined;
        }
    }

}

function isStringArray(value: any): value is string[] {
    if (!Array.isArray(value)) {
        return false;
    }
    return value.every((e) => typeof e === 'string');
}

function parseString(value: undefined | string | string[] | ParsedQs | ParsedQs[], parse: Parser, defaults?: any) {
    if (value === undefined) {
        const result = parse();
        return result === undefined && defaults !== undefined ? defaults : result;
    }
    if (typeof value === 'string' || isStringArray(value)) {
        const result = parse(value);
        return result === undefined && defaults !== undefined ? defaults : result;
    }
    throw new Error('A ParsedQs object can not be processed by a parse function');
}

function parseArrayOrObject(value: undefined | string | string[] | ParsedQs | ParsedQs[], parser: Template, defaults?: any) {
    if (value === undefined || typeof value === 'string') {
        throw new Error('A string or undefined object can not be processed by a parse config');
    }
    return parseQuery(value, parser, defaults);
}

function parseAny(query: string[] | ParsedQs | ParsedQs[], key: string | number, parser: Parser | Template, defaults?: any) {
    const value = query[key];
    const nextDefaults = defaults !== undefined ? defaults[key] : defaults;
    return typeof parser === 'function' ? parseString(value, parser, nextDefaults) : parseArrayOrObject(value, parser, nextDefaults);
}

function parseQuery(query: string[] | ParsedQs | ParsedQs[], template: Template, defaults?: any): any {
    const it = Object.entries(template);
    const array = [...it];
    if (Array.isArray(query)) {
        return array.map(([key, parser]) => {
            return parseAny(query, key, parser, defaults);
        });
    }
    return array.reduce((params, [key, parser]) => {
        const data = parseAny(query, key, parser, defaults);
        return {...params, [key]: data};
    }, {});
}

export function parse<T>(query: string[] | ParsedQs | ParsedQs[], template: Template, defaults?: any): T {
    return parseQuery(query, template, defaults);
}
