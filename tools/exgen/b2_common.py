# DELE B2 (format since 2019): reading 4 tasks/36 q/70 min · listening 5 tasks/30 q/40 min · writing 2 tasks/80 min · speaking 3 tasks/20 min + 20 prep
from gen_common import *

FORMAT = {
    "pass": "60/100 to pass, with at least 30/50 in each group (Group 1: reading + writing; Group 2: listening + speaking)",
    "lectura": "70 min · 4 tasks · 36 questions", "auditiva": "40 min · 5 tasks · 30 questions",
    "escritura": "80 min · 2 tasks", "oral": "20 min + 20 min prep · 3 tasks",
    "mins": {"lectura": 70, "auditiva": 40, "escritura": 80, "oral": 20},
}
MC3 = "Seleccione la opción correcta (a, b o c)."
