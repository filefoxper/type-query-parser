import {Parser} from "../libs/parser.type";

export interface ParsedQs { [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[] }

export type Template = {
    [key: string]: Template | Parser
} | Parser[];