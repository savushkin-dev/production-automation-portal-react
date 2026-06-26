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
        return $api.post(`${API_URL}/api/report/create`, {
            reportName,
            reportCategory,
            dbUrl,
            dbUsername,
            dbPassword,
            dbDriver,
            sql,
            parameters: JSON.stringify(parametersMeta),
            content,
            styles,
            script,
            sqlMode,
            dataBands: JSON.stringify(dataBands),
            bookOrientation,
            layoutSettingsParams: JSON.stringify(layoutSettingsParams),
            layoutParams: JSON.stringify(layoutParams)
        })
    }

    static async getReportsName() {
        return $api.get(`${API_URL}/api/report/names`)
    }

    static async getReportsNameGroupCategory() {
        return $api.get(`${API_URL}/api/report/grouped-by-category`)
    }

    static async getCategories() {
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
        return $api.post(`${API_URL}/api/report/data`, {
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

    static async getReportGlobalVars() {
        return $api.get(`${API_URL}/api/report/globalVars`)
    }

    static async saveReportGlobalVars(vars) {
        return $api.post(`${API_URL}/api/report/globalVars`, vars)
    }


    /**
     * Конвертирует сгруппированные отчеты в формат для вложенного Select.
     * Категория "В разработке" всегда первая.
     * Сортирует категории и отчеты по алфавиту без учета регистра.
     */
    static convertGroupedReportsToOptions(data) {
        const devCategory = "В разработке";

        const sortedData = [
            ...data.filter(item => item.category === devCategory),
            ...data.filter(item => item.category !== devCategory)
                .sort((a, b) => a.category.toLowerCase().localeCompare(b.category.toLowerCase()))
        ];

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

    /**
     * Преобразует категории в опции для Select.
     * Категория "В разработке" всегда первая и гарантированно присутствует.
     * Остальные категории сортируются по алфавиту без учета регистра.
     */
    static convertCategoriesToOptions = (categories) => {
        const devCategory = "В разработке";
        const allCategories = new Set([...categories, devCategory]);
        const sorted = [...allCategories]
            .filter(cat => cat !== devCategory)
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        return [
            {value: devCategory, label: devCategory},
            ...sorted.map(cat => ({value: cat, label: cat}))
        ];
    };

    /**
     * Добавляет значения по умолчанию для отсутствующих или пустых параметров
     */
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