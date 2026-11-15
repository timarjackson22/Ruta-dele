# DELE C2: the real exam has three combined papers (use of language + reading + listening 105 min; integrated
# listening-reading-writing 150 min; integrated reading-speaking 20 min + 30 prep). Here the first paper is split
# into its reading part (tasks 1–3) and its listening part (tasks 4–6) so it fits the app's four-paper layout.
from gen_common import *

FORMAT = {
    "pass": "60/100 to pass, with at least 30/50 in each group (Group 1: reading + writing; Group 2: listening + speaking). The real C2 groups papers differently; this sample keeps the app's four papers.",
    "lectura": "60 min · tasks 1–3 of Paper 1 · 26 questions (use of language and reading)", "auditiva": "45 min · tasks 4–6 of Paper 1 · 26 questions (listening)",
    "escritura": "150 min · 3 tasks (integrated listening, reading and writing)", "oral": "20 min + 30 min prep · 3 tasks",
    "mins": {"lectura": 60, "auditiva": 45, "escritura": 150, "oral": 20},
}
MC3 = "Seleccione la opción correcta (a, b o c)."
