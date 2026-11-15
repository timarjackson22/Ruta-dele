# DELE A2 (format since 2020): reading 4 tasks/25 q/60 min · listening 4 tasks/25 q/35 min · writing 2 tasks/45 min · speaking 4 tasks/12 min + 12 prep
from gen_common import *

FORMAT = {
    "pass": "60/100 to pass, with at least 30/50 in each group (Group 1: reading + writing; Group 2: listening + speaking)",
    "lectura": "60 min · 4 tasks · 25 questions", "auditiva": "35 min · 4 tasks · 25 questions",
    "escritura": "45 min · 2 tasks", "oral": "12 min + 12 min prep · 4 tasks",
    "mins": {"lectura": 60, "auditiva": 35, "escritura": 45, "oral": 12},
}
MC3 = "Seleccione la opción correcta (a, b o c)."
