# DELE B1 (format since 2020): reading 5 tasks/30 q/70 min · listening 5 tasks/30 q/40 min · writing 2 tasks/60 min · speaking 4 tasks/15 min + 15 prep
from gen_common import *

FORMAT = {
    "pass": "60/100 to pass, with at least 30/50 in each group (Group 1: reading + writing; Group 2: listening + speaking)",
    "lectura": "70 min · 5 tasks · 30 questions", "auditiva": "40 min · 5 tasks · 30 questions",
    "escritura": "60 min · 2 tasks", "oral": "15 min + 15 min prep · 4 tasks",
    "mins": {"lectura": 70, "auditiva": 40, "escritura": 60, "oral": 15},
}
MC3 = "Seleccione la opción correcta (a, b o c)."
