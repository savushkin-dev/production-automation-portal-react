

export const defaultScript = "import org.springframework.jdbc.core.JdbcTemplate;\n" +
    "import org.springframework.jdbc.datasource.DriverManagerDataSource;\n" +
    "import com.host.SpringBootAutomationProduction.util.ReportUtil;\n" +
    "\n" +
    "import java.time.*;\n" +
    "import java.time.format.*;\n" +
    "import javax.sql.*;\n" +
    "import java.util.*;\n" +
    "\n" +
    "public class ExampleScriptJava {\n" +
    "\n" +
    "    /**\n" +
    "    * Универсальный метод формирования данных для отчета\n" +
    "    * \n" +
    "    * @param params     входные параметры (пример: даты, фильтры, настройки сортировки)\n" +
    "    * @param globalVars глобальные переменные (пример: url к БД)\n" +
    "    * @return Map с результатом (табличные данные + вычисленные переменные)\n" +
    "    */\n" +
    "    public static Map<?,?> main(Map<String, String> params, Map<String, String> globalVars) {\n" +
    "        \n" +
    "        ReportUtil reportUtil = new ReportUtil(); //Используем специальный класс\n" +
    "\n" +
    "        List<Map<String, Object>> tableData = new ArrayList<>();\n" +
    "\n" +
    "        // Настройка подключения к базе данных\n" +
    "        DriverManagerDataSource dataSource = new DriverManagerDataSource();\n" +
    "        dataSource.setUrl(\"jdbc:postgresql://localhost:5432/some_db\");\n" +
    "        dataSource.setUsername(\"username\");\n" +
    "        dataSource.setPassword(\"password\");\n" +
    "        dataSource.setDriverClassName(\"org.postgresql.Driver\");\n" +
    "\n" +
    "        // Получение параметров фильтрации из входных данных и офрмирование SQL\n" +
    "        String sql = \"select * from TestTable WHERE datetime_field BETWEEN '\" + params.get(\"DateStart\") \n" +
    "               + \"' AND '\" + params.get(\"DateEnd\")+\"'\";\n" +
    "\n" +
    "        \n" +
    "        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);\n" +
    "        // Выполнение основного запроса\n" +
    "        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);\n" +
    "\n" +
    "        // Передаем данные в отчет\n" +
    "        reportUtil.addData(rows);\n" +
    "\n" +
    "        // Возвращаем результат\n" +
    "        return reportUtil.getResult();\n" +
    "    }\n" +
    "}\n";