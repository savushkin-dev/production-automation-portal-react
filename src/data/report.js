

export const defaultScript = "import org.springframework.jdbc.core.JdbcTemplate;\n" +
    "import org.springframework.jdbc.datasource.DriverManagerDataSource;\n" +
    "import com.host.SpringBootAutomationProduction.util.ReportUtil;\n" +
    "\n" +
    "import javax.sql.*;\n" +
    "import java.util.*;\n" +
    "\n" +
    "public class ExampleScriptJava {\n" +
    "\n" +
    "    public static Map<?,?> main(Map<String, String> params, Map<String, String> globalVars) {\n" +
    "        \n" +
    "        ReportUtil reportUtil = new ReportUtil(); //Используем специальный класс\n" +
    "\n" +
    "        List<Map<String, Object>> tableData = new ArrayList<>();\n" +
    "\n" +
    "        DriverManagerDataSource dataSource = new DriverManagerDataSource();\n" +
    "        dataSource.setUrl(\"jdbc:postgresql://localhost:5432/automation_production\");\n" +
    "        dataSource.setUsername(\"user\");\n" +
    "        dataSource.setPassword(\"1111\");\n" +
    "        dataSource.setDriverClassName(\"org.postgresql.Driver\");\n" +
    "\n" +
    "        String sql = \"select * from TestTable WHERE datetime_field BETWEEN '\" + params.get(\"DateStart\") \n" +
    "               + \"' AND '\" + params.get(\"DateEnd\")+\"'\";\n" +
    "\n" +
    "\n" +
    "        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);\n" +
    "        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);\n" +
    "\n" +
    "\n" +
    "        reportUtil.addData(rows); //Используем методы специального класса для формирования результата\n" +
    "\n" +
    "        return reportUtil.getResult();\n" +
    "    }\n" +
    "}\n";