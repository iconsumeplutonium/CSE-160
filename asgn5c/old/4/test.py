# testing out L-systems, to see if it was an avenue for idea 4 (procedural city generation)

axiom = "A"
iterationLimit = 10

i = 0
while i < iterationLimit:
    newSentence = ""
    for c in axiom:
        if (c == "A"):
            newSentence += "AB"
        elif (c == "B"):
            newSentence += "A"
        else:
            newSentence += c

    print(f"n = {i + 1}: {newSentence}")
    axiom = newSentence
    i += 1

