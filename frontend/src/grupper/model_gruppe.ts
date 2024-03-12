export class Gruppe{
    gruppe: string;
    type: string;
    beskrivelse: string;
    minimum_antal: number | null;
    maximum_antal: number | null;
    medlemmer: Array<{"fdfid": number, "tovholder": boolean}>;
}
