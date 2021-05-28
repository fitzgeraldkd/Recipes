export function roundDecimal(value, decimalPlace = 0) {
    return Math.round(value * (10 ** decimalPlace)) / (10 ** decimalPlace)
}

function measurementUnits() {
    const units = {
        // Volume
        gal: {
            min: 0.5,
            dimension: "volume",
            next: null,
            prev: { unit: "cup", conversion: 16 }
        },
        cup: {
            min: 0.25,
            dimension: "volume",
            next: { unit: "gal", conversion: 1 / 16 },
            prev: { unit: "tbsp", conversion: 16 }
        },
        floz: {
            min: 1,
            dimension: "volume",
            next: { unit: "cup", conversion: 1 / 8 },
            prev: { unit: "tbsp", conversion: 2 }
        },
        tbsp: {
            min: 1,
            dimension: "volume",
            next: { unit: "cup", conversion: 1 / 16 },
            prev: { unit: "tsp", conversion: 3 }
        },
        tsp: {
            min: 0,
            dimension: "volume",
            next: { unit: "tbsp", conversion: 1 / 3 },
            prev: null
        }
    };
    return units;
}

function getDimension(unit) {
    const units = measurementUnits();
    if (unit in units) {
        return units[unit].dimension;
    } else if (unit === "") {
        return "quantity";
    } else {
        return "dimension-" + unit;
    }
}

function convertUnits(quantity, unitIn, unitOut) {
    const units = measurementUnits();
    if (unitIn in units && unitOut in units) {
        if (units[unitIn].dimension === units[unitOut].dimension) {
            let factor = 1;
            let unit = unitIn;
            while (true) {
                if (units[unit].next != null) {
                    factor *= units[unit].next.conversion;
                    unit = units[unit].next.unit;
                    if (unit === unitOut) {
                        return { quantity: quantity * factor, unit: unit };
                    }
                } else {
                    break;
                }
            }

            factor = 1;
            unit = unitIn;
            while (true) {
                if (units[unit].prev != null) {
                    factor *= units[unit].prev.conversion;
                    unit = units[unit].prev.unit;
                    if (unit === unitOut) {
                        return { quantity: quantity * factor, unit: unit };
                    }
                } else {
                    break;
                }
            }
        }
    }

    return { quantity: quantity, unit: unitIn };
}

export function simplifyUnits(measurement) {
    const units = measurementUnits();
    let quantity = measurement.quantity;
    let unit = measurement.unit;
    if (unit in units) {
        while (true) {
            if (quantity < units[unit].min && units[unit].prev != null) {
                quantity *= units[unit].prev.conversion;
                unit = units[unit].prev.unit;
            } else if (units[unit].next != null) {
                if (quantity * units[unit].next.conversion >= units[units[unit].next.unit].min) {
                    quantity *= units[unit].next.conversion;
                    unit = units[unit].next.unit;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    }
    return { quantity: quantity, unit: unit };
}

export function addMeasurements(measurements) {
    const units = measurementUnits();
    const results = [];
    for (const measurement of measurements) {
        const dimension = getDimension(measurement.unit);
        if (results.findIndex(e => e.dimension === dimension) === -1) {
            results.push({
                dimension: dimension,
                quantity: measurement.quantity,
                unit: measurement.unit
            });
        } else {
            if (measurement.unit in units) {
                results.find(e => e.dimension === dimension).quantity += convertUnits(measurement.quantity, measurement.unit, results.find(e => e.dimension === dimension).unit).quantity;
            } else if (measurement.unit === results.find(e => e.dimension === dimension).unit) {
                results.find(e => e.dimension === dimension).quantity += measurement.quantity;
            } else {
                console.log("Error adding measurements.")
            }
        }
    }
    return results;
}