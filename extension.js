// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

const COLOR_REGEX = /(( |:|'|"|`)+)((#[A-Fa-f0-9]{2,8})|((rgb|RGB)(a|A)?\(( *(\d|\.)+ *,?){3,4}\))|(hsl|HSL)(a|A)?\(( *(\d|\.)+%? *,*){3,4}\))( |;|,|'|"|`)+/g;
const CSS_ATTRIBUTE_REGEX = /(--[^:]+): *([^;]+);/g;
const RGB_REGEX = /(rgb|RGB) *\( *([0-9]+) *, *([0-9]+) *, *([0-9]+).*/;

function extractColors(text) {
  let match;
  let matches = [];

  while ((match = COLOR_REGEX.exec(text))) {
    matches.push({
      index: match.index + match[1].length,
      value: match[3]
    });
  }

  return matches;
}

function extractRGB(test)
{
	let match;
	let r,g,b;
	let variable = test.attribute;
	let color = test.value;
	
	if (match = RGB_REGEX.exec(color))
	{
		r = parseInt(match[2]);
		g = parseInt(match[3]);
		b = parseInt(match[4]);
	}
	else
	{
		color = color.replace(/#/g, '');
		if (color.length == 3)
			color += color;
		if (color.length == 6)
		{
			r = eval('0x' + color.substr(0, 2));
			g = eval('0x' + color.substr(2, 2));
			b = eval('0x' + color.substr(4, 2));
		}
	}

	return {variable, r, g, b};
}

function findClosestColors()
{
	let activeEditor = vscode.window.activeTextEditor;
	let colorMatches = extractColors(activeEditor.document.getText());

	if (vscode.workspace.getConfiguration().has('closest-color.cssFile') &&
	    vscode.workspace.getConfiguration().get('closest-color.cssFile') != null)
	{
		fs.exists(vscode.workspace.getConfiguration().get('closest-color.cssFile'), function exists(exists)
		{
			if (exists)
			{
				for (let colorMatchIndex in colorMatches)
				{
					let colorToCompare = colorMatches[colorMatchIndex];
					const rgbToCompare = extractRGB(colorToCompare);
			
					fs.readFile(vscode.workspace.getConfiguration().get('closest-color.cssFile'), function read(err, data) {
						if (err) {
							vscode.window.showInformationMessage("erro");
							throw err;
						}
						let match;
						let matches = [];
						while((match = CSS_ATTRIBUTE_REGEX.exec(data)))
						{
							matches.push(
								{
									attribute: match[1],
									value: match[2]
								}
							)
						}
						let minimumDifference = Number.MAX_VALUE;
						let minimumVariable = [];
			
						for	(let matchIndex in matches)
						{
							const result = extractRGB(matches[matchIndex]);
							const difference = Math.sqrt(Math.pow(rgbToCompare.r-result.r, 2) + Math.pow(rgbToCompare.g-result.g, 2) + Math.pow(rgbToCompare.b-result.b, 2));
			
							if (difference < minimumDifference)
							{
								minimumDifference = difference;
								minimumVariable = [matches[matchIndex].attribute];
							}
							else if (difference == minimumDifference)
							{
								minimumVariable.push(matches[matchIndex].attribute);
							}
						}
			
						vscode.window.showInformationMessage("original: " + colorToCompare.value + " distance: " + minimumDifference + " candidates: " + minimumVariable.join(','));
					});
				}
			}
			else
			{
				vscode.window.showInformationMessage("file configured not found");
			}
		});
	}
	else
	{
		vscode.window.showInformationMessage("no css file configured");
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "closest-color" is now active!');

	let disposable = vscode.commands.registerCommand('extension.findClosestColors', () => 
	{
		findClosestColors();
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
