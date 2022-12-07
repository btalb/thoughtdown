A troublesome code block:

```bash {filename: analyse_pdfs, button: copy}
#!/usr/bin/env bash

device="ink_cov"
out="/tmp/pdf_trim/analysis.txt"

find . -name '*.pdf' | while read p; do
  gs -o - -sDEVICE="$device" "$p" | grep CMYK | grep -n '' | \
    sed 's/:/ /; s|^|'$in' '$(echo "$p" | sed 's|^\./||')' |' | \
    tee -a "$out"
done
```
