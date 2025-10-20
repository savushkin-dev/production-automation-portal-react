import $apiSchedule, {API_URL_SCHEDULER} from "../http/scheduler";
import moment from "moment/moment";

export let party = []
export let hardware = []

export let planByParty = []
export let planByHardware = []


const exampleResourse = {
    id: 1,
    title: 'group 1'
}

const exampleTask = {
    id: 1,
    group: 1,
    title: 'item 1',
    start_time: moment(),
    end_time: moment().add(1, 'hour'),
    canMove: false,
    canResize: false,

}

export default class ScheduleService {

    static async parseCleaningByParty(json) {
        const filteredData = json.jobs.filter(item => {
            return item.startCleaningDateTime !== item.startProductionDateTime;
        });
        let cleaning = [];
        for (let i = 0; i < filteredData.length; i++) {
            cleaning[i] = Object.assign({}, exampleTask);
            cleaning[i].id = filteredData[i].id + 'cl';
            cleaning[i].start_time = new Date(filteredData[i].startCleaningDateTime).getTime();
            cleaning[i].end_time = new Date(filteredData[i].startProductionDateTime).getTime();
            cleaning[i].title = "Мойка, переналадка";
            cleaning[i].group = filteredData[i].np;
            cleaning[i].itemProps = {
                style: {
                    background: '#f0f9ff',
                    border: '1px solid #dcdcdc',
                    color: "#0369a1",
                },
            };
            cleaning[i].info = { //Доп информация
                name: "Мойка",
                start: filteredData[i].startCleaningDateTime,
                end: filteredData[i].startProductionDateTime,
                line: filteredData[i].line.name,
                duration: Math.round(new Date(filteredData[i].startProductionDateTime) - new Date(filteredData[i].startCleaningDateTime))/ 60000,
            }
        }
        return cleaning;
    }

    static async parseCleaningByHardware(json) {
        const filteredData = json.jobs.filter(item => {
            return item.startCleaningDateTime !== item.startProductionDateTime;
        });
        let cleaning = [];
        for (let i = 0; i < filteredData.length; i++) {
            cleaning[i] = Object.assign({}, exampleTask);
            cleaning[i].id = i + "cleaning";
            cleaning[i].start_time = new Date(filteredData[i].startCleaningDateTime).getTime();
            cleaning[i].end_time = new Date(filteredData[i].startProductionDateTime).getTime();
            cleaning[i].title = "Мойка, переналадка";
            cleaning[i].group = filteredData[i].line.id;
            cleaning[i].itemProps = {
                style: {
                    background: '#f0f9ff',
                    border: '1px solid #dcdcdc',
                    color: "#0369a1",
                },
            };
            cleaning[i].info = { //Доп информация
                name: "Мойка",
                start: filteredData[i].startCleaningDateTime,
                end: filteredData[i].startProductionDateTime,
                line: filteredData[i].line.name,
                duration: Math.round(new Date(filteredData[i].startProductionDateTime) - new Date(filteredData[i].startCleaningDateTime))/ 60000,
            }
        }
        return cleaning;
    }

    static async parseParty(json) {
        party = [];
        const seenNp = new Map();
        json.jobs.forEach(item => {
            if (!seenNp.has(item.np)) {
                seenNp.set(item.np, item); // Сохраняем объект по ключу np
            }
        });
        party = Array.from(seenNp, ([np, originalItem], index) => ({
            ...exampleResourse,
            id: np,
            title: `Партия №${np}`,
            index: index
        }));
        return party;
    }


    static async parseHardware(json) {
        hardware = [];
        for (let i = 0; i < json.lines.length; i++) {
            hardware[i] = Object.assign({}, exampleResourse);
            hardware[i].id = json.lines[i].id;
            hardware[i].title = json.lines[i].name;
        }
        return hardware;
    }

    static async parsePlanByParty(json) {
        planByParty = [];

        for (let i = 0; i < json.jobs.length; i++) {
            planByParty[i] = Object.assign({}, exampleTask);
            planByParty[i].id = json.jobs[i].id;
            planByParty[i].start_time = new Date(json.jobs[i].startProductionDateTime).getTime();
            planByParty[i].end_time = new Date(json.jobs[i].endDateTime).getTime();
            planByParty[i].title = json.jobs[i].name;
            planByParty[i].group = json.jobs[i].np;

            planByParty[i].itemProps = {
                style: {
                    background: '#fffcd2',
                    border: '1px solid #dcdcdc',
                    color: "#a16207",
                }
            };
            planByParty[i].info = { //Доп информация
                name: json.jobs[i].name,
                start: json.jobs[i].startProductionDateTime,
                end: json.jobs[i].endDateTime,
                line: json.jobs[i].line.name,
                quantity: json.jobs[i].quantity,
                np: json.jobs[i].np,
                duration: Math.round(new Date(json.jobs[i].endDateTime) - new Date(json.jobs[i].startProductionDateTime))/ 60000,

                fullName: json.jobs[i].product.name,
                type: json.jobs[i].product.type,
                glaze: json.jobs[i].product.glaze,
                filling: json.jobs[i].product.filling,
                _allergen: json.jobs[i].product._allergen,
                pinned: json.jobs[i].pinned,
            }
        }

        let cleaning = await this.parseCleaningByParty(json)
        let result = [...planByParty, ...cleaning]
        return result;
    }

    static async parsePlanByHardware(json) {
        planByHardware = [];

        for (let i = 0; i < json.jobs.length; i++) {
            planByHardware[i] = Object.assign({}, exampleTask);
            planByHardware[i].id = json.jobs[i].id;
            planByHardware[i].start_time = new Date(json.jobs[i].startProductionDateTime).getTime();
            planByHardware[i].end_time = new Date(json.jobs[i].endDateTime).getTime();
            planByHardware[i].title = json.jobs[i].name;
            planByHardware[i].group = json.jobs[i].line.id;

            planByHardware[i].itemProps = {
                style: {
                    background: '#fffcd2',
                    border: '1px solid #dcdcdc',
                    color: "#a16207",
                }
            };
            planByHardware[i].info = { //Доп информация
                name: json.jobs[i].name,
                start: json.jobs[i].startProductionDateTime,
                end: json.jobs[i].endDateTime,
                line: json.jobs[i].line.name,
                quantity: json.jobs[i].quantity,
                np: json.jobs[i].np,
                duration: Math.round(new Date(json.jobs[i].endDateTime) - new Date(json.jobs[i].startProductionDateTime))/ 60000,

                fullName: json.jobs[i].product.name,
                type: json.jobs[i].product.type,
                glaze: json.jobs[i].product.glaze,
                filling: json.jobs[i].product.filling,
                _allergen: json.jobs[i].product._allergen,
                pinned: json.jobs[i].pinned,
            }
        }
        // console.log(planByHardware)
        let cleaning = await this.parseCleaningByHardware(json)
        let result = [...planByHardware, ...cleaning]
        return result;
    }


    static async assignSettings(startDate, endDate, idealEndDateTime, maxEndDateTime, lineStartTimes ) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/load`, {startDate, endDate, idealEndDateTime, maxEndDateTime, lineStartTimes: JSON.stringify(lineStartTimes)})
    }

    static async getPlan() {
        return $apiSchedule.get(`${API_URL_SCHEDULER}/schedule`)
    }

    static async getLines() {
        return $apiSchedule.get(`${API_URL_SCHEDULER}/schedule/lines`)
    }

    static async solve() {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/solve`, {})
    }

    static async savePlan() {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/saveToDb`, {})
    }

    static async removePlan() {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/removeSolution`, {})
    }

    static async stopSolving() {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/stopSolving`, {})
    }

    static async analyze() {
        return $apiSchedule.put(`${API_URL_SCHEDULER}/schedule/analyze`, {})
    }

    static async getExel() {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/export`, {}, {
            responseType: 'blob'
        });
    }

    static async pinItem(lineId, pinCount) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/pin`, {lineId, pinCount})
    }

}