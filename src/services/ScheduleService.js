import $apiSchedule, {API_URL_SCHEDULER} from "../http/scheduler";
import moment from "moment/moment";
import {isFactItem} from "../utils/scheduler/items";

export let hardware = []
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

    static async parseDateTimeSettings(json) {
        return json.lines
            .map((line, index) => ({
                id: String(index + 1),
                name: line.name.trim(),
                lineId: line.id,
                originalName: line.name.trim(),
                startDateTime: line.startDateTime,
                maxEndDateTime: line.maxEndTime,
            }))
            .sort((a, b) => {
                const numA = parseInt(a.name.match(/Линия №(\d+)/)?.[1] || 0);
                const numB = parseInt(b.name.match(/Линия №(\d+)/)?.[1] || 0);
                return numA - numB;
            });
    }

    static async parseCleaningByHardware(json) {
        const filteredData = json.jobs.filter(item => {
            return item.startCleaningDateTime !== item.startProductionDateTime;
        });
        let cleaning = [];
        for (let i = 0; i < filteredData.length; i++) {
            if(!filteredData[i].line){
                console.warn("Job with id " + filteredData[i].id + " has a null line field")
                continue;
            }
            let dur = Math.round(new Date(filteredData[i].startProductionDateTime) - new Date(filteredData[i].startCleaningDateTime))/ 60000;
            cleaning[i] = Object.assign({}, exampleTask);
            cleaning[i].id = i + "cleaning";
            cleaning[i].start_time = new Date(filteredData[i].startCleaningDateTime).getTime();
            cleaning[i].end_time = new Date(filteredData[i].startProductionDateTime).getTime();
            cleaning[i].title = "Мойка, переналадка";
            cleaning[i].group = filteredData[i].line?.id || "NAN";
            cleaning[i].itemProps = {
                style: {
                    background: dur >= 100? "#d9f6ff" : '#f0f9ff',
                    border: '1px solid #dcdcdc',
                    color: "#0369a1",
                },
            };
            cleaning[i].info = { //Доп информация
                name: "Мойка",
                start: filteredData[i].startCleaningDateTime,
                end: filteredData[i].startProductionDateTime,
                line: filteredData[i].line?.name || "NAN",
                duration: dur,
                pinned: false,
                lineInfo: json.jobs[i].line,
            }
        }
        return cleaning;
    }

    static async parseDelayByHardware(json) {
        const filteredData = json.jobs.filter(item => {
            return item.planEndDateTime !== null;
        });
        let cleaning = [];
        for (let i = 0; i < filteredData.length; i++) {
            if(!filteredData[i].line){
                console.warn("Job with id " + filteredData[i].id + " has a null line field")
                continue;
            }
            let dur = Math.round(new Date(filteredData[i].endDateTime) - new Date(filteredData[i].planEndDateTime))/ 60000;
            cleaning[i] = Object.assign({}, exampleTask);
            cleaning[i].id = i + "delay";
            cleaning[i].start_time = new Date(filteredData[i].planEndDateTime).getTime();
            cleaning[i].end_time = new Date(filteredData[i].endDateTime).getTime();
            cleaning[i].title = "Отклонение от плана";
            cleaning[i].group = filteredData[i].line?.id || "NAN";

            let colorGr = "#fff2db";
            cleaning[i].itemProps = {
                style: {
                    background: "linear-gradient(to right, #f4e9ff, " + colorGr +")",
                    border: '1px solid #dcdcdc',
                    color: "#0369a1",
                },
            };
            cleaning[i].info = { //Доп информация
                name: "Отклонение от плана",
                start: filteredData[i].planEndDateTime,
                end: filteredData[i].endDateTime,
                line: filteredData[i].line?.name || "NAN",
                duration: dur,
                pinned: false,
                lineInfo: filteredData[i].line,
                delayNote: filteredData[i].delayNote,
                parentJobId: filteredData[i].id
            }
        }
        return cleaning;
    }

    static async parseFactItemsByHardware(json) {
        const filteredData = json.jobs.filter(item => {
            return ((item.cameraEnd !== null) && (item.cameraStart !== null));
        });

        let factList = [];
        for (let i = 0; i < filteredData.length; i++) {
            if(!filteredData[i].line){
                console.warn("Fact with id " + filteredData[i].id + " has a null line field")
                continue;
            }

            factList[i] = Object.assign({}, exampleTask);
            factList[i].id = filteredData[i].id + "fact_camera";
            factList[i].start_time = new Date(filteredData[i].cameraStart).getTime();
            factList[i].end_time = new Date(filteredData[i].cameraEnd).getTime();
            factList[i].title = filteredData[i].name;
            factList[i].group = filteredData[i].lineIdFact;

            factList[i].itemProps = {
                style: {
                    background: this.getBgColorItem(filteredData[i]).bg,
                    border: '1px solid #dcdcdc',
                    color: this.getBgColorItem(filteredData[i]).color,
                }
            };
            factList[i].info = { //Доп информация
                name: filteredData[i].name,
                start: filteredData[i].startProductionDateTime,
                end: filteredData[i].endDateTime,
                line: filteredData[i].line?.name,
                quantity: filteredData[i].quantity,
                mass: filteredData[i].mass,
                np: filteredData[i].np,
                snpz: filteredData[i].snpz,
                duration: Math.round(new Date(filteredData[i].endDateTime) - new Date(filteredData[i].startProductionDateTime))/ 60000,
                durationFactCamera: Math.round(new Date(filteredData[i].cameraEnd) - new Date(filteredData[i].cameraStart))/ 60000,

                fullName: filteredData[i].product.name,
                type: filteredData[i].product.type,
                glaze: filteredData[i].product.glaze,
                filling: filteredData[i].product.filling,
                _allergen: filteredData[i].product._allergen,
                lineInfo: filteredData[i].line,
                maintenance: filteredData[i].maintenance,
                maintenanceId: filteredData[i].fid,
                maintenanceNote: filteredData[i].maintenanceNote,
                lineIdFact: filteredData[i].lineIdFact,
                startFact: filteredData[i].startProductionDateTimeFact,
                startCameraFact: filteredData[i].cameraStart,
                endCameraFact: filteredData[i].cameraEnd,
                placeFactInfo: filteredData[i].placeFactInfo,
                placePlan: filteredData[i].placePlan,
                dti: filteredData[i].dti,
                idBatch: json.jobs[i].idBatch,
            }
        }
        return factList;
    }

    static async parseHardware(json) {
        hardware = [];

        // Считаем общее mass для каждой линии
        const groupMass = json.jobs.reduce((acc, item) => {
            const lineId = item.line?.id;
            if (lineId) {
                if (!acc[lineId]) {
                    acc[lineId] = 0;
                }
                acc[lineId] += item.mass || 0;
            }
            return acc;
        }, {});

        const sortedLines = [...json.lines].sort((a, b) => {
            const numA = parseInt(a.name.match(/Линия №(\d+)/)?.[1] || 0);
            const numB = parseInt(b.name.match(/Линия №(\d+)/)?.[1] || 0);
            return numA - numB;
        });

        for (let i = 0; i < sortedLines.length; i++) {
            hardware[i] = Object.assign({}, exampleResourse);
            hardware[i].id = sortedLines[i].id;
            hardware[i].title = sortedLines[i].name;
            hardware[i].totalMass = groupMass[sortedLines[i].id] || 0; // Добавляем общее mass
        }

        return hardware;
    }

    static async parsePlanByHardware(json) {
        planByHardware = [];

        for (let i = 0; i < json.jobs.length; i++) {
            if(!json.jobs[i].line){
                console.warn("Job with id " + json.jobs[i].id + " has a null line field")
                continue;
            }

            planByHardware[i] = Object.assign({}, exampleTask);
            planByHardware[i].id = json.jobs[i].id;
            planByHardware[i].start_time = new Date(json.jobs[i].startProductionDateTime).getTime();

            let endTime;
            //Определяем было ли выравнивание
            if(json.jobs[i].planEndDateTime !== null){
                endTime = json.jobs[i].planEndDateTime;
            } else {
                endTime = json.jobs[i].endDateTime;
            }
            planByHardware[i].end_time = new Date(endTime).getTime();
            planByHardware[i].title = json.jobs[i].name;
            planByHardware[i].group = json.jobs[i].line.id ;

            planByHardware[i].itemProps = {
                style: {
                    background: this.getBgColorItem(json.jobs[i]).bg,
                    border: '1px solid #dcdcdc',
                    color: this.getBgColorItem(json.jobs[i]).color,
                }
            };
            planByHardware[i].info = { //Доп информация
                name: json.jobs[i].name,
                start: json.jobs[i].startProductionDateTime,
                end: endTime,
                planEndDateTime: json.jobs[i].planEndDateTime,
                line: json.jobs[i].line?.name,
                quantity: json.jobs[i].quantity,
                mass: json.jobs[i].mass,
                np: json.jobs[i].np,
                snpz: json.jobs[i].snpz,
                duration: Math.round(new Date(endTime) - new Date(json.jobs[i].startProductionDateTime))/ 60000,

                fullName: json.jobs[i].product.name,
                type: json.jobs[i].product.type,
                glaze: json.jobs[i].product.glaze,
                filling: json.jobs[i].product.filling,
                _allergen: json.jobs[i].product._allergen,
                lineInfo: json.jobs[i].line,
                maintenance: json.jobs[i].maintenance,
                maintenanceId: json.jobs[i].fid,
                maintenanceTypeId: json.jobs[i].maintenanceTypeId,
                maintenanceNote: json.jobs[i].maintenanceNote,
                lineIdFact: json.jobs[i].lineIdFact,
                startFact: json.jobs[i].startProductionDateTimeFact,
                startCameraFact: json.jobs[i].cameraStart,
                endCameraFact: json.jobs[i].cameraEnd,
                placeFactInfo: json.jobs[i].placeFactInfo,
                placePlan: json.jobs[i].placePlan,
                dti: json.jobs[i].dti,
                idBatch: json.jobs[i].idBatch,
            }
        }

        let factList = await this.parseFactItemsByHardware(json)
        let cleaning = await this.parseCleaningByHardware(json)
        let delay = await this.parseDelayByHardware(json)
        let result = [...planByHardware, ...cleaning]
        result = result.filter(item => item !== undefined);

        result = ScheduleService.defineAssignedJobs(result, json)
        result = [...result, ...delay]
        result = ScheduleService.defineGroupPositionDelayItems(result, json)
        result = [...result, ...factList]

        return result;
    }

    static getBgColorItem(item){
        if(item.maintenance === true){
            return {bg:"#ffeaea", color: "#a81a65"}
        }
        return {bg:"#fffcd2", color: "#a16207"}
    }

    static defineAssignedJobs(result, json){
        for (let i = 0; i < result.length; i++) {
            // Пропускаем cleaning элементы
            if(result[i].id.includes('cleaning')) {
                continue;
            }

            if(result[i].group === ""){
                return result
            }

            const index = json.lines.find(item => item.id === result[i].group).firstUnpinnedIndex
            const groupPos = ScheduleService.getGroupPosition(result[i].id, result).position

            if(groupPos <= index){
                result[i].info.pinned = true;
            }
            result[i].info.groupIndex = groupPos;
        }
        return result;
    }

    static defineGroupPositionDelayItems(result, json){
        for (let i = 0; i < result.length; i++) {
            if(result[i].id.includes('delay')) {
                if(result[i].group === ""){
                    return result
                }
                // Получаем позицию родителя для элемента delay
                result[i].info.groupIndex = ScheduleService.getGroupPosition(result[i].info.parentJobId, result).position;
            }
        }
        return result;
    }

    // Позиция в своей группе (без учета cleaning и фактических элементов)
    static getGroupPosition = (itemId, allItems) => {
        const item = allItems.find(i => i.id === itemId)
        if (!item) return {position: -1, total: 0}

        // Исключаем cleaning и фактические элементы из группы
        const groupItems = allItems.filter(i =>
            i.group === item.group && !i.id.includes('cleaning') && !i.id.includes('delay') && !isFactItem(i)
        )

        const sorted = groupItems.sort((a, b) =>
            new Date(a.start_time) - new Date(b.start_time)
        )

        const position = sorted.findIndex(i => i.id === itemId) + 1
        return {
            position,
            total: sorted.length
        }
    }

    static parseScoreString(errorString) {
        try {
            // Разбиваем строку по слэшам и убираем пустые элементы
            const parts = errorString.split('/').filter(part => part.length > 0);

            if (parts.length !== 3) {
                throw new Error('Неверный формат строки');
            }

            // Извлекаем числовые значения
            const hard = parseInt(parts[0].replace('hard', '')) || 0;
            const medium = parseInt(parts[1].replace('medium', '')) || 0;
            const soft = parseInt(parts[2].replace('soft', '')) || 0;

            // Берем абсолютные значения для всех показателей
            const hardAbs = Math.abs(hard);
            const mediumAbs = Math.abs(medium);

            // Вычисляем корень и округляем (тоже берем абсолютное значение)
            const softSqrt = Math.round(Math.sqrt(Math.abs(soft)));

            let result = {
                hard: hardAbs || 0,
                medium: mediumAbs,
                soft: softSqrt
            }
            return result;

        } catch (error) {
            return {
                hard: 0,
                medium: 0,
                soft: 0
            };
        }
    }

    static async init(startDate) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/init`, {startDate})
    }

    static async getPlan() {
        return $apiSchedule.get(`${API_URL_SCHEDULER}/schedule/frontData`)
    }

    static async getLines() {
        return $apiSchedule.get(`${API_URL_SCHEDULER}/schedule/lines`)
    }

    static async getServiceTypes() {
        return $apiSchedule.get(`${API_URL_SCHEDULER}/schedule/serviceTypes`)
    }

    static async solve() {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/solve`, {})
    }

    static async savePlan() {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/save`, {})
    }

    static async stopSolving() {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/stopSolving`, {})
    }

    static async analyze() {
        return $apiSchedule.put(`${API_URL_SCHEDULER}/schedule/analyze`, {})
    }

    static async pinItem(lineId, pinCount) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/pin`, {lineId, pinCount})
    }

    static async moveJobs(fromLineId, toLineId, fromIndex, count, insertIndex) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/moveJobs`, {fromLineId, toLineId, fromIndex, count, insertIndex})
    }

    static async sortRangeScheduler(fromIndex, sortCount, lineId, sortUp) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/sortRange`, {fromIndex, sortCount, lineId, sortUp})
    }

    static async assignServiceWork(lineId, insertIndex, durationMinutes, maintenanceTypeId, maintenanceNote) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/maintenance`, {lineId, insertIndex, durationMinutes, maintenanceTypeId, maintenanceNote})
    }

    static async assignServiceWorkEmptyLine(lineId, startProductionDateTime, durationMinutes, maintenanceTypeId, maintenanceNote) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/maintenance`, {lineId, startProductionDateTime, durationMinutes, maintenanceTypeId, maintenanceNote})
    }

    static async updateServiceWork(lineId, updateIndex, durationMinutes, maintenanceTypeId, maintenanceNote) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/maintenance`, {lineId, updateIndex, durationMinutes, maintenanceTypeId, maintenanceNote})
    }

    static async removeServiceWork(lineId, removeIndex) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/maintenance`, {lineId, removeIndex})
    }

    static async sortSchedule() {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/sortByNp`, {})
    }

    static async sendToWork() {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/work`, {})
    }

    static async alignPlan() {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/alignPlan`, {})
    }

    static async dailyCleaning() {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/dailyCleaning`, {})
    }

    static async reloadPlan(selection) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/selection`, {selection})
    }

    static async updateMaxEndDateTime(lineId, lineMaxEndDateTime) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/lineMaxEnd`, {lineId, lineMaxEndDateTime})
    }

    static async updateLineStart(lineId, startLineDateTime) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/lineStart`, {lineId, startLineDateTime})
    }

    static async reloadDirectory() {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/refreshData`, {})
    }

    static async determineFactPlace(snpz) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/findPlaceFact`, {snpz})
    }

    static async determineCameraFact(snpz) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/findCameraFact`, {snpz})
    }

    static async updateDelayJob(lineId, index, delayNote) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/delayNote`, {lineId, index, delayNote})
    }

}