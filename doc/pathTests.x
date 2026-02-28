'
'
' ####################
' #####  PROLOG  #####
' ####################
'
PROGRAM	"progname"  ' program/file name without .x or any .extent
VERSION	"0.0000"    ' version number - increment before saving altered program
'
' You can stop the PDE from inserting the following PROLOG comment lines
' by removing them from the prolog.xxx file in your \xb\xxx directory.
'
' Programs contain:  1: PROLOG          - no executable code - see below
'                    2: Entry function  - start execution at 1st declared func
' * = optional       3: Other functions - everything else - all other functions
'
' The PROLOG contains (in this order):
' * 1. Program name statement             PROGRAM "progname"
' * 2. Version number statement           VERSION "0.0000"
' * 3. Import library statements          IMPORT  "libName"
' * 4. Composite type definitions         TYPE <typename> ... END TYPE
'   5. Internal function declarations     DECLARE/INTERNAL FUNCTION Func (args)
' * 6. External function declarations     EXTERNAL FUNCTION FuncName (args)
' * 7. Shared constant definitions        $$ConstantName = literal or constant
' * 8. Shared variable declarations       SHARED  variable
'
' ******  Comment libraries in/out as needed  *****
'
	IMPORT	"xma"   ' Math library     : SIN/ASIN/SINH/ASINH/LOG/EXP/SQRT...
'	IMPORT	"xcm"   ' Complex library  : complex number library  (trig, etc)
	IMPORT	"xst"   ' Standard library : required by most programs
'	IMPORT	"xgr"   ' GraphicsDesigner : required by GuiDesigner programs
'	IMPORT	"xui"   ' GuiDesigner      : required by GuiDesigner programs
'

DECLARE FUNCTION  Entry ()
'
'
' ######################
' #####  Entry ()  #####
' ######################
'
' Programs contain:
'   1. A PROLOG with type/function/constant declarations.
'   2. This Entry() function where execution begins.
'   3. Zero or more additional functions.
'
FUNCTION  Entry ()

	SINGLE r
	SINGLE x
	SINGLE cx
	SINGLE cy
	SINGLE y
	SINGLE t
	SINGLE pi

	pi = 3.141596
	r = 100
	cx = 100
	cy = 100

	FOR a = 0 TO 360 STEP 20
		t = $$DEGTORAD * a
		x = cx + r * SIN(t)
		y = cy + r * COS(t)
		PRINT a,x,y
	NEXT

END FUNCTION
END PROGRAM
