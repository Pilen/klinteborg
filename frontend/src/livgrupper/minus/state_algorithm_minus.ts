
interface Week {
    week: number;
    periods: number;
    min_periods: number
    max_periods: number
    max_score_cutoff: number
    full_camp_bonus: number
    slots: number
}


WEEK1 = {
    week: 1,
    periods: 8,
    min_periods: 1,
    max_periods: 6,
    max_score_cutoff: 25,
    activity_bonus = 0,
    full_camp_bonus = 0,
    slots = 125 - 2 - 3,
}

WEEK2 = {
    week: 2
    periods: 8,
    min_periods: 1,
    max_periods: 6,
    max_score_cutoff: 25,
    activity_bonus: 0,
    full_camp_bonus: 0,
    slots: 95,
}


function lerp(
    value: number,
    in_min: number,
    in_max: number,
    out_min: number,
    out_max: number) {
    return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}


export class StateAlgorithmMinus {
    errors: Array<text> = [];

    constructor(persons: Array<ModelDeltagerMinus>, week: Week) {
        this.persons = $it(persons)
            .filter((person) => person.minus.get(week.week).max_periods > 0)
            .sort((person) => person.arbejdsbyrde_sum)
            .List();
        this.week = week;
    }

    public calculate() {
        let g = (person) => person.minus.get(this.week.week);
        let ratio (person) => g(person).periods / g(person).lscore;
        let max_score = $it(this.persons).Max((person) => person.arbejdsbyrde_sum);
        let total_max_periods = $it(this.persons).map((person) => g(person).max_periods).Sum();
        if (total_max_periods < this.week.slots) {
            this.errors.push(`Der er for få personer! ${total_max_periods} < {this.week.slots}`);
        }
        let slots = this.week.slots;
        $it(this.persons)
            .sideEffect((person) => {
                let minus = g(person);

                let lscore = min(max_score, this.week.MAX_SCORE_CUTOFF);
                let score = min(self.score, self.week.MAX_SCORE_CUTOFF);
                let lscore = lerp(score, 0, max_score, this.week.max_periods, this.week.min_periods);
                minus.score = lscore;

                minus.periods += minus.min_periods;
                slots -= minus.min_periods;
            })
            .Go();
        if (slots < 0) {
            this.errors.push(`Der var for få livgrupper til at folk kunne få deres minimum, nu er vi i underskud med ${slots}`);
        }
        while (slots > 0) {
            let person = $it(this.persons).MinKey((person) => g(person).periods < g(person).max_periods ? ratio(person) : 1_000_000_000)
            if (g(person).periods >= g(person).max_periods) {
                this.errors.push("Der er for få ledere eller for mange livgrupper");
                break;
            }
            g(person).periods += 1;
            slots -= 1;
        }
        if (len(this.errors) == 0) {
            if ($it(this.persons).map((person) => g(person).periods).Sum() != this.week.slots) {
                this.errors("Der er en regnefejl i algoritmen")
            }
        }
        this.persons = $it(this.persons).sort((person) => [-g(person).periods, ratio(person)]).List();
    }
}
