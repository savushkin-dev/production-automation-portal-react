import $api, {API_URL} from "../http";


export default class ReportService {



    static async getReportTemplateByReportName(reportName, category) {
        return $api.get(`${API_URL}/api/report/` + category + `/` + reportName)
    }

    static async getParametersMetaByReportName(reportName, category) {
        return $api.get(`${API_URL}/api/report/` + category + `/` + reportName + `/parameters`)
    }

    static async createReportTemplate(reportName, reportCategory, dbUrl, dbUsername, dbPassword, dbDriver, sql, parametersMeta,
                                      content, styles, script, sqlMode, dataBands, bookOrientation, layoutSettingsParams, layoutParams) {
        return $api.post(`${API_URL}/api/report/create`, {reportName, reportCategory, dbUrl, dbUsername,
            dbPassword, dbDriver, sql, parameters: JSON.stringify(parametersMeta), content, styles, script, sqlMode,
            dataBands: JSON.stringify(dataBands), bookOrientation, layoutSettingsParams: JSON.stringify(layoutSettingsParams), layoutParams: JSON.stringify(layoutParams)})
    }

    static async getReportsName() {
        return $api.get(`${API_URL}/api/report/names`)
    }

    static async getReportsNameGroupCategory() {
        return $api.get(`${API_URL}/api/report/categories`)
    }

    static async getDataByReportName(reportName, category, parameters) {
        return $api.post(`${API_URL}/api/report/data/` + category + `/` + reportName, {parameters})
    }

    static async updateReportTemplate(report) {
        return $api.patch(`${API_URL}/api/report/` + report.id, {
            id: report.id,
            reportName: report.reportName,
            reportCategory: report.reportCategory
        })
    }

    static async deleteReportTemplate(id) {
        return $api.delete(`${API_URL}/api/report/` + id)
    }

    static async getDataForReport(reportName, reportCategory, dbUrl, dbUsername, dbPassword, dbDriver, sql, content, styles, parameters, script, sqlMode) {
        return $api.post(`${API_URL}/api/report/data`,  {
            reportTemplateDTO: {
                reportName,
                reportCategory,
                dbUrl,
                dbUsername,
                dbPassword,
                dbDriver,
                sql,
                content,
                styles,
                script,
                sqlMode,
            },
            parameters: parameters
        });
    }

    static async getDataForReport2(reportName, reportCategory, dbUrl, dbUsername, dbPassword, dbDriver, sql, parameters, content, styles) {
        return $api.post(`${API_URL}/api/report/data`, {reportName, reportCategory, dbUrl, dbUsername,
            dbPassword, dbDriver, sql, parameters, content, styles})
    }

    static async getReportGlobalVars() {
        return $api.get(`${API_URL}/api/report/globalVars`)
    }

    static async saveReportGlobalVars(vars) {
        return $api.post(`${API_URL}/api/report/globalVars`, vars)
    }


    // Конвертация grouped data в формат для вложенного Select с сортировкой (без учета регистра)
    static convertGroupedReportsToOptions(data) {
        const sortedData = [...data].sort((a, b) =>
            a.category.toLowerCase().localeCompare(b.category.toLowerCase())
        );
        
        return sortedData.map(categoryGroup => ({
            label: categoryGroup.category,
            options: categoryGroup.reports
                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                .map(reportName => ({
                    value: JSON.stringify({
                        category: categoryGroup.category,
                        name: reportName
                    }),
                    label: reportName
                }))
        }));
    }

    //Добавляем параметры которые не были заданы
    static addDefaultParameters(params, paramDescriptions) {
        const result = {...params};
        paramDescriptions.forEach(description => {
            const {key, default: defaultValue} = description;
            if (!(key in result) || result[key] === undefined || result[key] === null) {
                if (description.type === "DATE" && defaultValue === true) {
                    result[key] = new Date().toISOString().split('T')[0];
                } else {
                    result[key] = defaultValue;
                }
            }
        });

        return result;
    }

}