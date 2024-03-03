export interface License {
    id: number;
    short_title: string;
    title: string;
    by_attribution?: boolean;
    share_alike?: boolean;
    commercial_use?: boolean;
    summary: string;
    link: string;
}

export interface Unit {
    id: number;
    name: string;
    symbol: string;
}

export interface Thesaurus {
    id: number;
    uuid: string;
    name: string;
    title: string;
    organisation: string;
    url: string;
    description: string;
}

export interface Keyword {
    id: number;
    uuid: string;
    value: string;
    path: string;
    children: string[];
    thesaurusName: Thesaurus;
}

export interface Variable {
    id: number;
    name: string;
    symbol: string;
    unit: Unit;
    column_names: string[];
    keyword?: Keyword;
}

export interface Author {
    id: number;
    uuid: string;
    first_name?: string | null;
    last_name?: string | null;
    is_organisation?: boolean;
    affiliation?: string | null;
    attribution?: string | null;
    organisation_name?: string | null;
    organisation_abbrev?: string | null;
}

