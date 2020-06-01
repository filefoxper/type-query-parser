import {Parser} from "./parser.type";

const isSafeInteger = Number.isSafeInteger || function (value: number) {
    return Number.isInteger(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER;
};

const matchInteger = (value?: string) => /^(-)?[0-9][0-9]*$/.test(value || '');

const matchNatural = (value?: string) => /^[0-9][0-9]*$/.test(value || '');

export const integerParser: Parser = (value?: string): number | undefined => {
    return matchInteger(value) && isSafeInteger(Number(value)) ? Number(value) : undefined;
};

export const naturalParser: Parser = (value?: string): number | undefined => {
    return matchNatural(value) && isSafeInteger(Number(value)) ? Number(value) : undefined;
};

export const numberParser: Parser = (value?: string): number | undefined => {
    const data = Number(value || undefined);
    return isNaN(data) ? undefined : data;
};

export const booleanParser: Parser = (value?: string): boolean | undefined => {
    if (value === undefined) {
        return undefined;
    }
    if (value.trim() === 'true') {
        return true;
    }
    if (value.trim() === 'false') {
        return false;
    }
};
