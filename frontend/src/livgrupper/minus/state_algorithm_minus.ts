
interface Week {
    week: number;
    periods: number;
    min_periods: number
    max_periods: number
    max_score_cutoff: number
    full_camp_bonus: number
    slots: number
}


export const WEEK_1 = {
    week: 1,
    periods: 8,
    min_periods: 1,
    max_periods: 6,
    max_score_cutoff: 25,
    activity_bonus: 0,
    full_camp_bonus: 0,
    slots: 125 - 2 - 3,
};

export const WEEK_2 = {
    week: 2,
    periods: 8,
    min_periods: 1,
    max_periods: 6,
    max_score_cutoff: 25,
    activity_bonus: 0,
    full_camp_bonus: 0,
    slots: 95,
};


function lerp(
    value: number,
    in_min: number,
    in_max: number,
    out_min: number,
    out_max: number) {
    return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}


export function algorithmMinus(persons: Array<ModelDeltagerMinus>, week: Week)  {
    let s = new StateAlgorithmMinus(persons, week)
    s.calculate()
    return s.errors
}

export class StateAlgorithmMinus {
    errors: Array<text> = [];

    constructor(persons: Array<ModelDeltagerMinus>, week: Week) {
        this.persons = $it(persons)
            .filter((person) => person.minus.get(week.week).max_periods > 0)
            .sort((person) => person.arbejdsbyrde_sum)
            .List();
        this.week = week;
        this.errors = [];
    }

    public calculate() {
        let g = (person) => person.minus.get(this.week.week);
        let ratio = (person) => g(person).periods / g(person).score;
        let largest_arbejdsbyrde_sum = $it(this.persons).map((person) => person.arbejdsbyrde_sum).Max();
        let total_max_periods = $it(this.persons).map((person) => g(person).max_periods).Sum();
        if (total_max_periods < this.week.slots) {
            this.errors.push(`Der er for få personer! ${total_max_periods} < {this.week.slots}`);
        }
        let slots = this.week.slots;
        $it(this.persons)
            .sideEffect((person) => {
                let minus = g(person);
                let max_score = Math.min(largest_arbejdsbyrde_sum, this.week.max_score_cutoff);
                let arbejdsbyrde = Math.min(person.arbejdsbyrde_sum, this.week.max_score_cutoff);
                let score = lerp(arbejdsbyrde, 0, max_score, minus.max_periods, minus.min_periods);
                minus.score = score;
                minus.periods = minus.min_periods;
                slots -= minus.min_periods;
            })
            .Go();
        if (slots < 0) {
            this.errors.push(`Der var for få livgrupper til at folk kunne få deres minimum, nu er vi i underskud med ${slots}`);
        }
        while (slots > 0) {
            let person = $it(this.persons).MinKey((person) => g(person).periods < g(person).max_periods ? ratio(person) : 1_000_000_000);
            if (g(person).periods > g(person).max_periods) {
                this.errors.push("Der er for få ledere eller for mange livgrupper");
                break;
            }
            g(person).periods += 1;
            slots -= 1;
        }
        $it(this.persons)
            .sideEffect((person) => {
                g(person).ratio = ratio(person);
            }).Go();
        if (this.errors.length === 0) {
            let s = $it(this.persons).map((person) => g(person).periods).Sum()
            if (s != this.week.slots) {
                this.errors.push(`Der er en regnefejl i algoritmen ${s} != ${this.week.slots}`)
            }
        }
        // this.persons = $it(this.persons).sort((person) => [-g(person).periods, ratio(person)]).List();
    }
}
