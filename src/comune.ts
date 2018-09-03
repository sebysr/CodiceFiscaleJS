import { COMUNI } from './comuni';
import { normalizeString } from './utils';

export interface IComuneObject {
    nome: string;
    prov?: string;
    cc?: string;
}
/**
 * Comune class
 */
export class Comune {
    public nome: string;
    public prov: string;
    public cc:   string;

    public get nomeNorm() : string {
        return normalizeString(this.nome);
    }

    constructor (nome: string, prov?: string, cc?: string, check: boolean = true) {
        this.nome = nome;
        this.prov = prov;
        this.cc   = cc;
        if (check || this.cc === undefined || this.prov === undefined) {
            let comune : IComuneObject;
            comune = this.prov !== undefined ? this.searchByNameAndProvince(this.nome, this.prov) : this.searchByName(this.nome);
            if (comune === undefined) {
                throw new Error(`Comune with name ${this.nome} doesn't exist`);
            } else if (this.cc !== undefined && comune.cc !== this.cc) {
                throw new Error(`Comune with cc ${this.cc} doesn't exist`);
            } else {
                this.prov = comune.prov;
                this.cc = comune.cc;
            }
        }
    }

    // tslint:disable-next-line:function-name member-access
    static GetByName(name: string, prov? : string): Comune {
        return new Comune(name, prov);
    }

    // tslint:disable-next-line:function-name member-access
    static GetByCC(cc: string): Comune {
        let result;
        for (const item of COMUNI) {
            if (item[0] === cc) {
                result = item;
                break;
            }
        }
        if (result !== undefined) {
            return new Comune(result[2], result[1], result[0], false);
        }
        throw new Error(`Comune with cc ${cc} doesn't exist`);
    }

    private searchByName(nome: string): IComuneObject {
        const query = normalizeString(nome);
        let left : number = 0;
        let right : number = COMUNI.length - 1;
        const result = [];
        while (left <= right) {
            const middle = Math.floor((left + right) / 2);
            const currentItem = COMUNI[middle];
            if (query === currentItem[2]) {
                result.push(currentItem);
                // Search for comuni with the same name in the neighbourhood +/- 1
                if (middle > 0 && COMUNI[middle - 1][2] === query) {
                    result.push(COMUNI[middle - 1]);
                } else if (middle < COMUNI.length - 1 && COMUNI[middle + 1][2] === query) {
                    result.push(COMUNI[middle + 1]);
                }
                break;
            } else if (query < currentItem[2]) {
                right = middle - 1;
            } else {
                left = middle + 1;
            }
        }

        if (result.length === 1) {
            return { cc : result[0][0], prov : result[0][1], nome: result[0][2] };
        } else if (result.length > 1) {
            throw new Error(`Comune with name of ${nome} is found in more than one province. Please specify the province code`);
        } else {
            throw new Error(`Comune with name of ${nome} doesn't exists`);
        }

    }

    private searchByNameAndProvince(nome: string, prov: string): IComuneObject {
        const query = normalizeString(nome);
        let left : number = 0;
        let right : number = COMUNI.length - 1;
        let result;
        while (left <= right) {
            const middle = Math.floor((left + right) / 2);
            const currentItem = COMUNI[middle];
            if (query === currentItem[2]) {
                if (prov === currentItem[1]) {
                    result = currentItem;
                // Search for comuni with the same name in the neighbourhood +/- 1
                } else if (middle > 0 && COMUNI[middle - 1][2] === query && prov === COMUNI[middle - 1][1]) {
                    result = COMUNI[middle - 1];
                } else if (middle < COMUNI.length - 1 && COMUNI[middle + 1][2] === query && prov === COMUNI[middle + 1][1]) {
                    result = COMUNI[middle + 1];
                }
                break;
            } else if (query < currentItem[2]) {
                right = middle - 1;
            } else {
                left = middle + 1;
            }
        }

        if (result !== undefined) {
            return { cc : result[0], prov : result[1], nome: result[2] };
        }  else {
            throw new Error(`Comune with name of ${nome} and prov ${prov} doesn't exists`);
        }

    }
}
