/*
 * qix-hierarchy-select v99.11.0
 * Hierarchical Tree Filter for Qlik Sense
 * Baseline + Overlay architecture: all values always visible
 * v40: Native-identical collapsed bar (title + colored selection segments), native header/search styling
 */

!(function (e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = t(require("@nebula.js/stardust")))
    : "function" == typeof define && define.amd
      ? define(["@nebula.js/stardust"], t)
      : ((e = "undefined" != typeof globalThis ? globalThis : e || self)[
          "qixHierarchySelect"
        ] = t(e.stardust));
})(this, function (stardust) {
  "use strict";

  // ============================================================
  // CSS (injected once at runtime)
  // ============================================================
  var CSS = [
    "/* qix-hierarchy-select v49.0.0 — native look */",
    ".qhf-root{width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;font-family:var(--qhf-font,'Source Sans Pro',Arial,sans-serif);color:var(--qhf-text,#404040);position:relative;}",
    /* Header: exact native listbox header — 32px, padding 0 4px 0 2px, margin-bottom 8px */
    ".qhf-header{padding:0 4px 0 2px;flex-shrink:0;height:32px;display:flex;align-items:center;gap:0;margin-bottom:8px;font-family:var(--qhf-header-font,inherit);font-size:var(--qhf-header-font-size,13px);font-weight:var(--qhf-header-font-weight,700);font-style:var(--qhf-header-font-style,normal);text-decoration:var(--qhf-header-text-decoration,none);color:var(--qhf-header-color,inherit);}",
    ".qhf-header-title{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;align-self:center;}",
    /* Search toggle — 28x28 button with 7px padding, 12x12 SVG, native colors */
    ".qhf-search-toggle{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;cursor:pointer;border-radius:4px;flex-shrink:0;padding:7px;color:rgb(84,84,84);transition:opacity 0.15s,background 0.15s;}",
    ".qhf-search-toggle svg{width:12px;height:12px;}",
    ".qhf-search-toggle:hover{background:var(--qhf-hover,rgba(0,0,0,0.05));}",
    ".qhf-search-toggle.qhf-search-active{color:var(--qhf-accent,#4477AA);}",
    /* Search bar — used in expanded (non-popup) mode, hidden by default, toggles on */
    ".qhf-search-wrap{padding:0 8px 8px;flex-shrink:0;display:none;}",
    ".qhf-search-wrap.qhf-search-open{display:block;}",
    ".qhf-search{width:100%;box-sizing:border-box;border:1px solid rgba(0,0,0,0.15);border-radius:4px;padding:5px 8px 5px 28px;font-size:12px;font-family:inherit;color:inherit;background:var(--qhf-search-bg,rgba(0,0,0,0.03)) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E\") 8px center no-repeat;outline:none;}",
    ".qhf-search:focus{border-color:var(--qhf-accent,#4477AA);box-shadow:0 0 0 2px rgba(68,119,170,0.15);}",
    ".qhf-tree-scroll{flex:1;overflow-y:auto;overflow-x:hidden;}",
    /* Rows — pixel-match native: 29px height, 12px font, 0.12 border */
    ".qhf-node{display:flex;align-items:center;border-bottom:1px solid rgba(0,0,0,0.12);height:29px;min-height:29px;max-height:29px;padding:0;padding-left:9px;cursor:pointer;user-select:none;font-size:12px;font-weight:400;box-sizing:border-box;}",
    ".qhf-node:hover:not(.qhf-selected):not(.qhf-excluded):not(.qhf-alternative){background:rgba(0,0,0,0.03);}",
    /* State colors — driven by CSS vars set from theme at runtime */
    ".qhf-node.qhf-selected{background:var(--qhf-sel-bg,#00873D);color:var(--qhf-sel-text,#FFFFFF);}",
    ".qhf-node.qhf-excluded{background:var(--qhf-excl-bg,#BEBEBE);color:var(--qhf-excl-text,#404040);}",
    ".qhf-node.qhf-alternative{background:var(--qhf-alt-bg,#E4E4E4);color:var(--qhf-alt-text,#404040);}",
    /* Toggle arrow — subtle, native sized */
    ".qhf-toggle{width:18px;height:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:3px;font-size:10px;color:inherit;transition:transform 0.15s ease,opacity 0.15s ease;opacity:0.4;}",
    ".qhf-toggle:hover{opacity:0.8;background:rgba(0,0,0,0.06);}",
    ".qhf-toggle.qhf-expanded{transform:rotate(90deg);}",
    ".qhf-toggle.qhf-hidden{visibility:hidden;}",
    ".qhf-node.qhf-selected .qhf-toggle,.qhf-node.qhf-excluded .qhf-toggle,.qhf-node.qhf-alternative .qhf-toggle{color:inherit;opacity:0.7;}",
    /* Checkmark — 24px area on the right, SVG tick like native (8x8 rendered) */
    ".qhf-tick{width:24px;height:28px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-left:auto;opacity:0;}",
    ".qhf-node.qhf-selected .qhf-tick{opacity:1;color:inherit;}",
    /* Label — native padding, 12px font */
    ".qhf-label{flex:1;padding:0 2px;font-family:var(--qhf-content-font,inherit);font-size:var(--qhf-content-font-size,12px);font-weight:var(--qhf-content-font-weight,normal);font-style:var(--qhf-content-font-style,normal);text-decoration:var(--qhf-content-text-decoration,none);color:var(--qhf-content-color,inherit);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:28px;}",
    /* On selection-state rows, label + mark inherit the auto-contrast color from .qhf-node */
    ".qhf-node.qhf-selected .qhf-label,.qhf-node.qhf-excluded .qhf-label,.qhf-node.qhf-alternative .qhf-label{color:inherit;}",
    ".qhf-label mark{background:rgba(68,119,170,0.25);color:inherit;border-radius:2px;padding:0 1px;}",
    ".qhf-count{font-size:10px;opacity:0.5;margin-left:4px;flex-shrink:0;}",
    ".qhf-children{overflow:hidden;transition:max-height 0.2s ease;}",
    ".qhf-children.qhf-collapsed{max-height:0 !important;}",
    ".qhf-placeholder{display:flex;align-items:center;justify-content:center;height:100%;padding:20px;text-align:center;font-size:12px;color:#999;flex-direction:column;gap:10px;}",
    "@keyframes qhf-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}",
    ".qhf-spinner{width:24px;height:24px;border:3px solid rgba(0,0,0,0.1);border-top-color:var(--qhf-accent,#4477AA);border-radius:50%;animation:qhf-spin 0.8s linear infinite;}",
    ".qhf-selecting{pointer-events:none;opacity:0.7;transition:opacity 0.15s ease;}",
    ".qhf-no-match{padding:12px 16px;font-size:12px;color:#999;text-align:center;}",
    ".qhf-toolbar{display:flex;align-items:center;gap:4px;padding:3px 8px;border-top:1px solid rgba(0,0,0,0.12);flex-shrink:0;}",
    ".qhf-toolbar-btn{padding:2px 8px;font-size:11px;border:none;border-radius:3px;cursor:pointer;font-family:inherit;}",
    ".qhf-toolbar-expand{background:transparent;color:var(--qhf-text,#404040);opacity:0.5;}",
    ".qhf-toolbar-expand:hover{opacity:1;background:var(--qhf-hover,rgba(0,0,0,0.04));}",
    ".qhf-toolbar-spacer{flex:1;}",
    ".qhf-node:focus-visible{outline:2px solid var(--qhf-accent,#4477AA);outline-offset:-2px;border-radius:2px;}",
    ".qhf-tree-scroll::-webkit-scrollbar{width:6px;}",
    ".qhf-tree-scroll::-webkit-scrollbar-track{background:transparent;}",
    ".qhf-tree-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.15);border-radius:3px;}",
    ".qhf-tree-scroll::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.25);}",
    /* Collapsed bar — native folded-listbox: title row + colored selection bar, packed at bottom */
    ".qhf-collapsed-bar{width:100%;height:34px;display:flex;flex-direction:column;justify-content:space-between;box-sizing:border-box;cursor:pointer;color:rgb(64,64,64);overflow:hidden;background:#fff;border:1px solid rgb(217,217,217);border-radius:3px;}",
    ".qhf-collapsed-bar:hover{background:rgba(0,0,0,0.015);}",
    ".qhf-collapsed-title{flex-shrink:0;height:27px;display:flex;align-items:center;padding:0 8px;font-family:UniverseNext-Bold,Arial,sans-serif;font-weight:700;font-size:13px;letter-spacing:0.09282px;color:rgb(64,64,64);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
    ".qhf-collapsed-selbar{flex-shrink:0;height:5px;display:flex;flex-direction:row;align-items:flex-end;width:100%;}",
    ".qhf-collapsed-seg{height:4px;flex-shrink:0;}",
    /* Popup */
    ".qhf-popup-overlay{position:fixed;top:0;left:0;width:100%;height:100%;z-index:99998;background:transparent;}",
    ".qhf-popup{position:fixed;z-index:99999;background:#fff;border-radius:4px;box-shadow:rgba(0,0,0,0.2) 0px 5px 5px -3px,rgba(0,0,0,0.14) 0px 8px 10px 1px,rgba(0,0,0,0.12) 0px 3px 14px 2px;display:flex;flex-direction:column;max-height:min(480px,60vh);min-width:220px;overflow:hidden;font-family:var(--qhf-font,'Source Sans Pro',Arial,sans-serif);color:var(--qhf-text,#404040);}",
    ".qhf-popup .qhf-popup-header{padding:0 4px 0 9px;height:32px;font-weight:700;font-size:13px;font-family:UniverseNext-Bold,Arial,sans-serif;display:flex;align-items:center;flex-shrink:0;gap:0;}",
    ".qhf-popup .qhf-popup-header-title{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 1px 0 0;}",
    ".qhf-popup .qhf-popup-hdr-btn{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;cursor:pointer;border-radius:4px;flex-shrink:0;color:inherit;padding:7px;transition:opacity 0.12s,background 0.12s;}",
    ".qhf-popup .qhf-popup-hdr-btn:hover{background:rgba(0,0,0,0.06);}",
    ".qhf-popup .qhf-popup-hdr-btn svg{width:1em;height:1em;font-size:16px;}",
    ".qhf-popup .qhf-popup-search{flex-shrink:0;height:37px;display:flex;align-items:center;border-bottom:1px solid rgba(0,0,0,0.12);padding:0;box-sizing:border-box;}",
    ".qhf-popup .qhf-popup-search input{flex:1;border:none;outline:none;height:100%;padding:8.5px 0 8.5px 9px;font-size:14px;font-family:'Source Sans Pro','Segoe UI',Arial,sans-serif;color:rgb(64,64,64);background:transparent;box-sizing:border-box;}",
    ".qhf-popup .qhf-popup-search input::placeholder{color:rgb(160,160,160);}",
    ".qhf-popup .qhf-popup-search .qhf-popup-search-icon{width:36px;height:37px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:rgb(140,140,140);}",
    ".qhf-popup .qhf-tree-scroll{flex:1;overflow-y:auto;overflow-x:hidden;}",
  ].join("\n");

  var cssInjected = false;
  function injectCSS() {
    if (cssInjected) return;
    var s = document.createElement("style");
    s.setAttribute("data-qhf", "1");
    s.textContent = CSS;
    document.head.appendChild(s);
    cssInjected = true;
  }

  // ============================================================
  // Utility helpers
  // ============================================================
  function isDarkBg(c) {
    if (!c) return false;
    var r, g, b;
    // Handle rgb()/rgba() format from getColorPickerColor
    var rgbMatch = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (rgbMatch) {
      r = parseInt(rgbMatch[1], 10);
      g = parseInt(rgbMatch[2], 10);
      b = parseInt(rgbMatch[3], 10);
    } else if (c.charAt(0) === "#" && c.length >= 7) {
      r = parseInt(c.slice(1, 3), 16);
      g = parseInt(c.slice(3, 5), 16);
      b = parseInt(c.slice(5, 7), 16);
    } else {
      return false;
    }
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
  }

  function resolveBg(layout, theme) {
    var comps = layout.components || [];
    for (var i = 0; i < comps.length; i++) {
      if (comps[i].key === "general" && comps[i].bgColor) return comps[i].bgColor;
    }
    var bg = theme.getStyle("object", "", "backgroundColor");
    return bg || theme.getStyle("", "", "backgroundColor") || "#FFFFFF";
  }

  function resolvePaletteColor(theme, pc, fallback) {
    if (!pc) return fallback;
    if (pc.index === -1) return pc.color || fallback;
    try {
      var c = theme.getColorPickerColor(pc);
      if (c && c !== "none") return c;
    } catch (e) {}
    return pc.color || fallback;
  }

  // Apply inline text color to a row and its label/toggle/tick children.
  // This is BOMBPROOF — doesn't rely on CSS inheritance or custom properties.
  function applyInlineTextColor(row, textColor) {
    if (!textColor) {
      row.style.color = "";
      var l = row.querySelector(".qhf-label"); if (l) l.style.color = "";
      var t = row.querySelector(".qhf-toggle"); if (t) t.style.color = "";
      var k = row.querySelector(".qhf-tick"); if (k) k.style.color = "";
      return;
    }
    row.style.color = textColor;
    var l = row.querySelector(".qhf-label"); if (l) l.style.color = textColor;
    var t = row.querySelector(".qhf-toggle"); if (t) t.style.color = textColor;
    var k = row.querySelector(".qhf-tick"); if (k) k.style.color = textColor;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    var safe = escapeHtml(text);
    var idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return safe;
    var before = escapeHtml(text.substring(0, idx));
    var match = escapeHtml(text.substring(idx, idx + query.length));
    var after = escapeHtml(text.substring(idx + query.length));
    return before + "<mark>" + match + "</mark>" + after;
  }

  var _uid = 0;
  function uid() { return "qhf_" + (++_uid); }
  /** Stable ID derived from tree position (for DOM patching) */
  function stableId(dimIndex, text, parentPath) {
    return "qhf_" + (parentPath || "") + dimIndex + "_" + text;
  }

  // ============================================================
  // Baseline / Overlay helpers (core of the "never disappear" fix)
  // ============================================================

  /** State priority — higher wins when merging states */
  function statePrio(s) {
    if (s === "L") return 5;
    if (s === "S") return 4;
    if (s === "O") return 3;
    if (s === "A") return 2;
    return 1; // X or unknown
  }

  /** Build per-dimension state maps from the current (possibly filtered) matrix */
  function buildStateMap(matrix, numDims) {
    var maps = [];
    for (var d = 0; d < numDims; d++) maps.push({});
    for (var r = 0; r < matrix.length; r++) {
      for (var d = 0; d < numDims; d++) {
        var cell = matrix[r][d];
        if (!cell || cell.qText === null || cell.qText === undefined) break;
        var st = cell.qState || "O";
        var prev = maps[d][cell.qText];
        if (!prev || statePrio(st) > statePrio(prev)) {
          maps[d][cell.qText] = st;
        }
      }
    }
    return maps;
  }

  /**
   * Overlay qState from stateMap onto tree nodes built from baseline.
   * - If a value exists in current data, use its state from the engine.
   * - If absent AND its dimension has active selections → mark Alternative (A).
   * - If absent AND its dimension has no active selections → mark Excluded (X).
   * This mimics native filter pane behavior.
   */
  function overlayStates(nodes, stateMap, dimLevel, hcDimInfo, staleMap, crossDimSelected) {
    var sc = hcDimInfo[dimLevel] ? (hcDimInfo[dimLevel].qStateCounts || {}) : {};
    var dimHasSelected = (sc.qSelected || 0) > 0;
    var dimHasExcluded = (sc.qExcluded || 0) > 0;
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var map = stateMap[dimLevel];

      // Cross-dim fix: if this node was just clicked in a cross-dim selection
      // and the HyperCube cross-filters it out of the data, mark it "S" directly.
      if (crossDimSelected && crossDimSelected.dimLevel === dimLevel && crossDimSelected.text === node.text) {
        node.qState = "S";
        if (node.children && node.children.length > 0) {
          overlayStates(node.children, stateMap, dimLevel + 1, hcDimInfo, staleMap, crossDimSelected);
        }
        continue;
      }

      if (map && map.hasOwnProperty(node.text)) {
        var mapState = map[node.text];
        // When the stateMap is stale (built from baseline with all "O" values),
        // use qDimensionInfo.qStateCounts to infer correct states. We can't
        // determine which specific value is "S" without real data, but we can
        // mark "O" values as "A" (alternative) when selections exist — the
        // background data fetch will correct the actual "S" value.
        if (staleMap && mapState === "O") {
          if (dimHasSelected) {
            node.qState = "A";
          } else if (dimHasExcluded) {
            node.qState = "X";
          } else {
            node.qState = "O";
          }
        } else {
          node.qState = mapState;
        }
      } else {
        if (dimHasSelected) {
          node.qState = "A";
        } else {
          node.qState = "X";
        }
      }
      if (node.children && node.children.length > 0) {
        overlayStates(node.children, stateMap, dimLevel + 1, hcDimInfo, staleMap, crossDimSelected);
      }
    }
  }

  /** Check if any dimension has active selections */
  function hasActiveSelections(hc) {
    for (var i = 0; i < hc.qDimensionInfo.length; i++) {
      var sc = hc.qDimensionInfo[i].qStateCounts || {};
      if ((sc.qSelected || 0) > 0) return true;
    }
    return false;
  }

  /** Baseline cache key — by object ID + field names only (no state counts) */
  function getBaselineKey(layout, hc) {
    var objId = layout.qInfo ? layout.qInfo.qId : "default";
    var dimFields = hc.qDimensionInfo.map(function(d) {
      return d.qFallbackTitle;
    }).join("|");
    return objId + "::" + dimFields;
  }

  // ============================================================
  // Tree Builders
  // ============================================================

  /**
   * Parent-Child mode: dims = [ParentID, ChildID, DisplayName]
   */
  function buildTreeParentChild(matrix) {
    var nodeMap = {};
    var allIds = {};
    var rows = [];

    for (var r = 0; r < matrix.length; r++) {
      var parentId = matrix[r][0].qText;
      var childId = matrix[r][1].qText;
      var name = matrix[r][2] ? matrix[r][2].qText : childId;
      var qElem = matrix[r][1].qElemNumber;
      var qState = matrix[r][1].qState || "O";

      if (childId === null || childId === undefined || childId === "") continue;
      if (nodeMap[childId]) continue;

      var node = {
        id: uid(),
        childId: childId,
        parentId: parentId,
        text: name || childId,
        qElemNumber: qElem,
        qState: qState,
        dimIndex: 1,
        children: [],
        depth: 0
      };
      nodeMap[childId] = node;
      allIds[childId] = true;
      rows.push(node);
    }

    var roots = [];
    var visited = {};

    for (var i = 0; i < rows.length; i++) {
      var n = rows[i];
      var parent = nodeMap[n.parentId];
      if (parent && parent.childId !== n.childId) {
        if (!visited[n.childId]) {
          visited[n.childId] = true;
          parent.children.push(n);
        } else {
          roots.push(n);
        }
      } else {
        roots.push(n);
      }
    }

    function assignDepth(nodes, d) {
      for (var j = 0; j < nodes.length; j++) {
        nodes[j].depth = d;
        assignDepth(nodes[j].children, d + 1);
      }
    }
    assignDepth(roots, 0);
    return roots;
  }

  /**
   * Multi-Dimension mode: dims = [Level1, Level2, ...]
   * Builds tree by grouping across dimension columns left-to-right.
   */
  function buildTreeMultiDim(matrix, numDims) {
    var root = { children: [], _childMap: {}, _path: "" };

    for (var r = 0; r < matrix.length; r++) {
      var row = matrix[r];
      var current = root;

      for (var d = 0; d < numDims; d++) {
        var cell = row[d];
        if (!cell || cell.qText === null || cell.qText === undefined) break;

        var key = cell.qText;
        if (!current._childMap[key]) {
          var nodeId = stableId(d, key, current._path);
          var node = {
            id: nodeId,
            text: key,
            qElemNumber: cell.qElemNumber,
            qState: cell.qState || "O",
            dimIndex: d,
            depth: d,
            children: [],
            _childMap: {},
            _path: nodeId + "/"
          };
          current._childMap[key] = node;
          current.children.push(node);
        } else {
          var existing = current._childMap[key];
          if (cell.qState === "S") existing.qState = "S";
          else if (cell.qState === "X" && existing.qState !== "S") existing.qState = "X";
        }
        current = current._childMap[key];
      }
    }

    function cleanMap(nodes) {
      for (var i = 0; i < nodes.length; i++) {
        delete nodes[i]._childMap;
        delete nodes[i]._path;
        cleanMap(nodes[i].children);
      }
    }
    cleanMap(root.children);
    return root.children;
  }

  // ============================================================
  // Search / Filter
  // ============================================================
  function filterTree(nodes, query) {
    if (!query) return nodes;
    var lq = query.toLowerCase();
    var result = [];

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var textMatch = node.text.toLowerCase().indexOf(lq) !== -1;
      var filteredChildren = filterTree(node.children, query);

      if (textMatch || filteredChildren.length > 0) {
        result.push({
          id: node.id,
          text: node.text,
          qElemNumber: node.qElemNumber,
          qState: node.qState,
          dimIndex: node.dimIndex,
          depth: node.depth,
          childId: node.childId,
          parentId: node.parentId,
          children: filteredChildren,
          _matchSelf: textMatch
        });
      }
    }
    return result;
  }

  // ============================================================
  // Collect descendant qElemNumbers (for "select with children")
  // ============================================================
  function collectElemNumbers(node, dimIndex) {
    var result = [];
    if (node.dimIndex === dimIndex) {
      result.push(node.qElemNumber);
    }
    for (var i = 0; i < node.children.length; i++) {
      var childResults = collectElemNumbers(node.children[i], dimIndex);
      for (var j = 0; j < childResults.length; j++) {
        if (result.indexOf(childResults[j]) === -1) result.push(childResults[j]);
      }
    }
    return result;
  }

  // Collect all currently-selected (qState "S") qElemNumbers for a given dimension
  function collectSelectedElems(roots, dimIndex) {
    var result = [];
    function walk(nodes) {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.dimIndex === dimIndex && n.qState === "S" && result.indexOf(n.qElemNumber) === -1) {
          result.push(n.qElemNumber);
        }
        if (n.children && n.children.length > 0) walk(n.children);
      }
    }
    walk(roots);
    return result;
  }

  function countLeaves(node) {
    if (node.children.length === 0) return 1;
    var c = 0;
    for (var i = 0; i < node.children.length; i++) {
      c += countLeaves(node.children[i]);
    }
    return c;
  }

  // ============================================================
  // Renderer (with DOM patching for selection state updates)
  // ============================================================

  /** Patch existing DOM nodes in-place when only selection states changed.
   *  opts must contain expandState, expandLevel, searchQuery for visible-count check. */
  function patchTreeStates(container, roots, opts) {
    if (!container) return false;
    var allNodes = container.querySelectorAll(".qhf-node[data-node-id]");
    if (allNodes.length === 0) return false;

    // Build a flat map of nodeId -> new state from the tree
    var stateMap = {};
    function walkStates(nodes) {
      for (var i = 0; i < nodes.length; i++) {
        stateMap[nodes[i].id] = nodes[i].qState;
        if (nodes[i].children) walkStates(nodes[i].children);
      }
    }
    walkStates(roots);

    // Count expected VISIBLE nodes (respecting expand state).
    // If DOM has fewer nodes than expected, the tree was reduced by filtered
    // HyperCube data — must do a full rebuild to add the missing nodes.
    if (opts) {
      var expectedVisible = 0;
      function countVisible(nodes) {
        for (var vi = 0; vi < nodes.length; vi++) {
          expectedVisible++;
          var hasKids = nodes[vi].children && nodes[vi].children.length > 0;
          if (hasKids && getExpanded(nodes[vi], opts)) {
            countVisible(nodes[vi].children);
          }
        }
      }
      countVisible(roots);
      if (allNodes.length !== expectedVisible) return false; // Node count mismatch — structure changed
    }

    // Check if every DOM node has a matching entry in stateMap.
    var domIds = [];
    for (var i = 0; i < allNodes.length; i++) {
      var nid = allNodes[i].getAttribute("data-node-id");
      if (stateMap[nid] === undefined) return false; // DOM has a node not in tree — structure changed
      domIds.push(nid);
    }
    if (domIds.length === 0) return false; // No nodes to patch

    // Patch each node's state classes
    for (var i = 0; i < allNodes.length; i++) {
      var el = allNodes[i];
      var nodeId = el.getAttribute("data-node-id");
      var newState = stateMap[nodeId];
      if (newState === undefined) return false; // Node missing, need full rebuild

      // Remove old state classes
      el.classList.remove("qhf-selected", "qhf-excluded", "qhf-alternative");

      // Apply new state
      var stcMap = (opts && opts.stateTextColors) || {};
      if (newState === "S") {
        el.classList.add("qhf-selected");
        el.setAttribute("aria-selected", "true");
      } else if (newState === "X") {
        el.classList.add("qhf-excluded");
        el.setAttribute("aria-selected", "false");
      } else if (newState === "A") {
        el.classList.add("qhf-alternative");
        el.setAttribute("aria-selected", "false");
      } else {
        el.setAttribute("aria-selected", "false");
      }

      // Apply inline text color for auto-contrast
      var stcColor = stcMap[newState] || "";
      applyInlineTextColor(el, stcColor);

      // Show/hide tick
      var tickEl = el.querySelector(".qhf-tick");
      if (tickEl) tickEl.style.opacity = (newState === "S") ? "1" : "0";
    }
    return true; // Successfully patched
  }

  /** Patch or build collapsed selection bar segments in-place */
  function patchCollapsedSelBar(selBar, hc) {
    var totalSelected = 0, totalExcluded = 0, totalAlternative = 0, totalPossible = 0;
    if (hc.qDimensionInfo) {
      for (var di = 0; di < hc.qDimensionInfo.length; di++) {
        var sc = hc.qDimensionInfo[di].qStateCounts || {};
        totalSelected += (sc.qSelected || 0);
        totalExcluded += (sc.qExcluded || 0);
        totalAlternative += (sc.qAlternative || 0);
        totalPossible += (sc.qOption || 0);
      }
    }
    var totalAll = totalSelected + totalExcluded + totalAlternative + totalPossible;
    selBar.innerHTML = "";
    if (totalAll > 0) {
      var segments = [
        { count: totalSelected, color: "var(--qhf-sel-bg,#00873D)" },
        { count: totalPossible, color: "#FFFFFF" },
        { count: totalAlternative, color: "var(--qhf-alt-bg,#E4E4E4)" },
        { count: totalExcluded, color: "rgb(169,169,169)" }
      ];
      for (var si = 0; si < segments.length; si++) {
        if (segments[si].count > 0) {
          var seg = document.createElement("div");
          seg.className = "qhf-collapsed-seg";
          seg.style.width = ((segments[si].count / totalAll) * 100) + "%";
          seg.style.background = segments[si].color;
          selBar.appendChild(seg);
        }
      }
    } else {
      // Empty state: still show the full-width white bar (matches native behavior)
      var emptySeg = document.createElement("div");
      emptySeg.className = "qhf-collapsed-seg";
      emptySeg.style.width = "100%";
      emptySeg.style.background = "#FFFFFF";
      selBar.appendChild(emptySeg);
    }
  }

  // ---- Focus preservation across DOM rebuilds ----
  // A rebuild detaches the focused tree row, which drops focus to <body> and
  // breaks keyboard navigation. Capture the row's id before, restore after.

  // Returns the data-node-id of the focused tree row inside container, or null
  // if focus is elsewhere (another instance, the search box, outside entirely).
  function captureFocusedNodeId(container) {
    var ae = document.activeElement;
    if (!ae || !container || !container.contains(ae)) return null;
    var row = (ae.classList && ae.classList.contains("qhf-node"))
      ? ae
      : (ae.closest ? ae.closest(".qhf-node") : null);
    return row ? row.getAttribute("data-node-id") : null;
  }

  // Refocus the row with the given id, if it still exists after the rebuild
  // (it may have been filtered out by a search). Compares attributes rather
  // than using an attribute selector — node ids embed dimension values that
  // can contain quotes and would break the selector.
  function restoreFocusedNode(container, nodeId) {
    if (!nodeId || !container) return;
    var rows = container.querySelectorAll(".qhf-node[data-node-id]");
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].getAttribute("data-node-id") === nodeId) {
        // preventScroll keeps the restored scroll position from being
        // overridden by the browser scrolling the row into view
        try { rows[i].focus({ preventScroll: true }); } catch (e) { rows[i].focus(); }
        return;
      }
    }
  }

  function renderTree(element, roots, opts) {
    var container = element.querySelector(".qhf-tree-scroll");
    if (!container) return;

    if (roots.length === 0) {
      container.innerHTML = '<div class="qhf-no-match">No matches found</div>';
      return;
    }

    // Try DOM patching first (fast path for selection state changes)
    if (!opts.searchQuery && !opts._forceFullRender && patchTreeStates(container, roots, opts)) {
      return; // Successfully patched in-place — scroll position preserved
    }

    // If skipRebuildOnPatchFail is set (popup during active selection),
    // don't do a full rebuild — the current DOM is close enough and a
    // rebuild would cause visible flash/scroll-reset in the popup.
    if (opts._skipRebuildOnPatchFail) {
      return;
    }

    // Full rebuild (structure changed, search active, or first render)
    // Save scroll position and keyboard focus before rebuild so we can restore them
    var savedScroll = container.scrollTop;
    var focusedNodeId = captureFocusedNodeId(container);
    container.innerHTML = "";
    for (var i = 0; i < roots.length; i++) {
      renderBranch(container, roots[i], opts);
    }
    // Restore scroll position after full rebuild
    if (savedScroll > 0) container.scrollTop = savedScroll;
    // Restore keyboard focus to the same row, if it survived the rebuild
    restoreFocusedNode(container, focusedNodeId);
  }

  function renderBranch(parent, node, opts) {
    var hasChildren = node.children && node.children.length > 0;
    var isExpanded = hasChildren && getExpanded(node, opts);
    var indent = node.depth * opts.indentPx;

    var row = document.createElement("div");
    row.className = "qhf-node";
    row.setAttribute("role", "treeitem");
    row.setAttribute("aria-level", String(node.depth + 1));
    row.setAttribute("tabindex", "-1");
    row.setAttribute("data-node-id", node.id);

    if (hasChildren) {
      row.setAttribute("aria-expanded", String(isExpanded));
    }

    // Selection state classes
    if (node.qState === "S") {
      row.classList.add("qhf-selected");
      row.setAttribute("aria-selected", "true");
    } else if (node.qState === "X") {
      row.classList.add("qhf-excluded");
      row.setAttribute("aria-selected", "false");
    } else if (node.qState === "A") {
      row.classList.add("qhf-alternative");
      row.setAttribute("aria-selected", "false");
    } else {
      row.setAttribute("aria-selected", "false");
    }

    // Indent spacer
    if (indent > 0) {
      var spacer = document.createElement("span");
      spacer.style.width = indent + "px";
      spacer.style.flexShrink = "0";
      row.appendChild(spacer);
    }

    // Toggle icon
    var toggle = document.createElement("span");
    toggle.className = "qhf-toggle";
    if (hasChildren) {
      if (isExpanded) toggle.classList.add("qhf-expanded");
      toggle.innerHTML = getToggleIcon(opts.iconStyle);
      toggle.addEventListener("click", function(e) {
        e.stopPropagation();
        var childContainer = row.nextElementSibling;
        if (childContainer && childContainer.classList.contains("qhf-children")) {
          var wasExpanded = !childContainer.classList.contains("qhf-collapsed");
          if (wasExpanded) {
            childContainer.classList.add("qhf-collapsed");
            childContainer.style.maxHeight = "0";
            toggle.classList.remove("qhf-expanded");
          } else {
            childContainer.classList.remove("qhf-collapsed");
            childContainer.style.maxHeight = "none";
            toggle.classList.add("qhf-expanded");
          }
        }
        opts.onToggle(node.id);
      });
    } else {
      toggle.classList.add("qhf-hidden");
    }
    row.appendChild(toggle);

    // Label
    var label = document.createElement("span");
    label.className = "qhf-label";
    label.innerHTML = highlightMatch(node.text, opts.searchQuery);
    row.appendChild(label);

    // Count badge
    if (opts.showCount && hasChildren) {
      var count = document.createElement("span");
      count.className = "qhf-count";
      count.textContent = "(" + node.children.length + ")";
      row.appendChild(count);
    }

    // Tick area (24px right side, SVG checkmark — matches native)
    var tick = document.createElement("span");
    tick.className = "qhf-tick";
    tick.innerHTML = "<svg width='12' height='12' viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='2.5 8 6.5 12 13.5 4'/></svg>";
    row.appendChild(tick);

    // Apply inline text color for auto-contrast (doesn't rely on CSS inheritance)
    if (opts.stateTextColors && (node.qState === "S" || node.qState === "X" || node.qState === "A")) {
      var stc = opts.stateTextColors[node.qState];
      if (stc) {
        row.style.color = stc;
        label.style.color = stc;
        toggle.style.color = stc;
        tick.style.color = stc;
      }
    }

    // Click handler for selection
    row.addEventListener("click", function(e) {
      e.stopPropagation();
      if (e.target.classList.contains("qhf-toggle")) return;
      opts.onSelect(node);
    });

    // Keyboard navigation
    row.addEventListener("keydown", function(e) {
      handleKeyboard(e, node, row, opts);
    });

    parent.appendChild(row);

    // Children container
    if (hasChildren) {
      var childContainer = document.createElement("div");
      childContainer.className = "qhf-children";
      childContainer.setAttribute("role", "group");
      if (!isExpanded) {
        childContainer.classList.add("qhf-collapsed");
        childContainer.style.maxHeight = "0";
      } else {
        childContainer.style.maxHeight = "none";
      }
      childContainer.setAttribute("data-parent-id", node.id);

      for (var c = 0; c < node.children.length; c++) {
        renderBranch(childContainer, node.children[c], opts);
      }
      parent.appendChild(childContainer);
    }
  }

  function getToggleIcon(style) {
    switch (style) {
      case "plusMinus": return "<svg width='10' height='10' viewBox='0 0 10 10'><line x1='2' y1='5' x2='8' y2='5' stroke='currentColor' stroke-width='1.5'/><line class='qhf-plus-v' x1='5' y1='2' x2='5' y2='8' stroke='currentColor' stroke-width='1.5'/></svg>";
      case "folder": return "\uD83D\uDCC1";
      default: return "<svg width='8' height='8' viewBox='0 0 8 8'><path d='M2 1 L6 4 L2 7' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>";
    }
  }

  function getExpanded(node, opts) {
    if (opts.expandState.hasOwnProperty(node.id)) {
      return opts.expandState[node.id];
    }
    if (opts.searchQuery) return true;
    if (opts.expandLevel === -1) return true;
    return node.depth < opts.expandLevel;
  }

  function handleKeyboard(e, node, row, opts) {
    var key = e.key;
    if (key === "Enter" || key === " ") {
      e.preventDefault();
      opts.onSelect(node);
    } else if (key === "Escape") {
      // Escape: cancel active selection or blur the tree
      e.preventDefault();
      e.stopPropagation();
      if (opts.selections && opts.selections.isActive && opts.selections.isActive()) {
        if (typeof opts.selections.cancel === "function") opts.selections.cancel();
      }
      // Close popup if open
      if (opts.localState && opts.localState.popupEl) {
        opts.closePopup && opts.closePopup();
      }
      row.blur();
    } else if (key === "Tab") {
      // Tab: cycle focus — search → first value → selection toolbar
      e.preventDefault();
      e.stopPropagation();
      var rootContainer = row.closest(".qhf-root") || row.closest(".qhf-popup");
      if (rootContainer) {
        var searchEl = rootContainer.querySelector(".qhf-search");
        if (searchEl && document.activeElement !== searchEl) {
          searchEl.focus();
        } else {
          // Focus the first tree node
          var firstNode = rootContainer.querySelector(".qhf-node");
          if (firstNode && firstNode !== row) firstNode.focus();
        }
      }
    } else if (key === "ArrowRight" && node.children && node.children.length > 0) {
      e.preventDefault();
      var isExp = getExpanded(node, opts);
      if (!isExp) {
        opts.onToggle(node.id);
      } else {
        var nextNode = row.nextElementSibling;
        if (nextNode) {
          var firstChild = nextNode.querySelector(".qhf-node");
          if (firstChild) firstChild.focus();
        }
      }
    } else if (key === "ArrowLeft") {
      e.preventDefault();
      var isExp2 = node.children && node.children.length > 0 && getExpanded(node, opts);
      if (isExp2) {
        opts.onToggle(node.id);
      } else {
        var parentGroup = row.parentElement;
        if (parentGroup && parentGroup.classList.contains("qhf-children")) {
          var parentRow = parentGroup.previousElementSibling;
          if (parentRow && parentRow.classList.contains("qhf-node")) parentRow.focus();
        }
      }
    } else if (key === "ArrowDown") {
      e.preventDefault();
      focusNext(row, 1);
    } else if (key === "ArrowUp") {
      e.preventDefault();
      focusNext(row, -1);
    }
  }

  function focusNext(currentRow, direction) {
    var allNodes = currentRow.closest(".qhf-tree-scroll").querySelectorAll(".qhf-node");
    var arr = Array.prototype.slice.call(allNodes);
    arr = arr.filter(function(n) {
      var el = n;
      while (el && el.classList) {
        if (el.classList.contains("qhf-collapsed")) return false;
        el = el.parentElement;
      }
      return true;
    });
    var idx = arr.indexOf(currentRow);
    if (idx === -1) return;
    var next = arr[idx + direction];
    if (next) next.focus();
  }

  // ============================================================
  // Property Panel — structured like native Filter Pane
  // ============================================================
  function propertyPanel() {
    return {
      definition: {
        type: "items",
        component: "accordion",
        items: {
          data: {
            uses: "data"
          },
          sorting: {
            uses: "sorting"
          },
          addons: {
            uses: "addons"
          },
          settings: {
            uses: "settings",
            items: {
              presentation: {
                type: "items",
                label: "Presentation",
                items: {
                  styleEditor: {
                    component: "styling-panel",
                    chartTitle: "Listboxes",
                    translation: "LayerStyleEditor.component.styling",
                    subtitle: "LayerStyleEditor.component.styling",
                    ref: "components",
                    useGeneral: true,
                    useBackground: true,
                    items: {
                      // === Section: Header ===
                      headerSection: {
                        translation: "properties.Header",
                        component: "panel-section",
                        items: {
                          headerItems: {
                            component: "items",
                            ref: "components",
                            key: "header",
                            items: {
                              headerFontWrapper: {
                                component: "inline-wrapper",
                                items: {
                                  headerFontFamily: {
                                    ref: "style.fontFamily",
                                    component: "dropdown",
                                    width: true,
                                    defaultValue: "UniverseNext",
                                    schemaIgnore: true,
                                    options: [
                                      { value: "UniverseNext", label: "UniverseNext" },
                                      { value: "Arial", label: "Arial" },
                                      { value: "Helvetica", label: "Helvetica" },
                                      { value: "'Source Sans Pro'", label: "Source Sans Pro" },
                                      { value: "Times New Roman", label: "Times New Roman" },
                                      { value: "Courier New", label: "Courier New" }
                                    ]
                                  },
                                  headerFontStyle: {
                                    component: "font-style-buttons",
                                    width: false,
                                    ref: "style.fontStyle",
                                    defaultValue: ["bold"],
                                    schemaIgnore: true
                                  },
                                  headerFontSize: {
                                    ref: "style.fontSize",
                                    component: "dropdown",
                                    width: false,
                                    defaultValue: "12px",
                                    schemaIgnore: true,
                                    options: [
                                      { value: "8px", label: "8" },
                                      { value: "9px", label: "9" },
                                      { value: "10px", label: "10" },
                                      { value: "11px", label: "11" },
                                      { value: "12px", label: "12" },
                                      { value: "13px", label: "13" },
                                      { value: "14px", label: "14" },
                                      { value: "16px", label: "16" },
                                      { value: "18px", label: "18" },
                                      { value: "20px", label: "20" },
                                      { value: "24px", label: "24" }
                                    ]
                                  },
                                  headerFontColor: {
                                    ref: "style.fontColor",
                                    component: "color-picker",
                                    defaultValue: { index: -1, color: "#404040" },
                                    width: "auto",
                                    schemaIgnore: true
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      // === Section: Content ===
                      contentSection: {
                        translation: "properties.Content",
                        component: "panel-section",
                        items: {
                          contentItems: {
                            component: "items",
                            ref: "components",
                            key: "content",
                            items: {
                              contentFontWrapper: {
                                component: "inline-wrapper",
                                items: {
                                  contentFontFamily: {
                                    ref: "style.fontFamily",
                                    component: "dropdown",
                                    width: true,
                                    defaultValue: "UniverseNext",
                                    schemaIgnore: true,
                                    options: [
                                      { value: "UniverseNext", label: "UniverseNext" },
                                      { value: "Arial", label: "Arial" },
                                      { value: "Helvetica", label: "Helvetica" },
                                      { value: "'Source Sans Pro'", label: "Source Sans Pro" },
                                      { value: "Times New Roman", label: "Times New Roman" },
                                      { value: "Courier New", label: "Courier New" }
                                    ]
                                  },
                                  contentFontStyle: {
                                    component: "font-style-buttons",
                                    width: false,
                                    ref: "style.fontStyle",
                                    defaultValue: [],
                                    schemaIgnore: true
                                  },
                                  contentFontSize: {
                                    ref: "style.fontSize",
                                    component: "dropdown",
                                    width: false,
                                    defaultValue: "12px",
                                    schemaIgnore: true,
                                    options: [
                                      { value: "8px", label: "8" },
                                      { value: "9px", label: "9" },
                                      { value: "10px", label: "10" },
                                      { value: "11px", label: "11" },
                                      { value: "12px", label: "12" },
                                      { value: "13px", label: "13" },
                                      { value: "14px", label: "14" },
                                      { value: "16px", label: "16" },
                                      { value: "18px", label: "18" },
                                      { value: "20px", label: "20" },
                                      { value: "24px", label: "24" }
                                    ]
                                  },
                                  contentFontColor: {
                                    ref: "style.fontColor",
                                    component: "color-picker",
                                    defaultValue: { index: -1, color: "#404040" },
                                    width: "auto",
                                    schemaIgnore: true
                                  }
                                }
                              },
                              autoContrast: {
                                component: "checkbox",
                                type: "boolean",
                                ref: "style.useContrastColor",
                                translation: "properties.dataPoints.valuelabel.contrast",
                                defaultValue: true,
                                schemaIgnore: true
                              }
                            }
                          }
                        }
                      },
                      // === Section: Selection State ===
                      selectionStateSection: {
                        label: "Selection state",
                        component: "panel-section",
                        items: {
                          selectionStateItems: {
                            component: "items",
                            ref: "components",
                            key: "listbox",
                            items: {
                              selectedColor: {
                                label: "Selected",
                                ref: "style.selectedColor",
                                component: "color-picker",
                                defaultValue: { index: -1, color: "#00873D" },
                                schemaIgnore: true
                              },
                              alternativeColor: {
                                label: "Alternative",
                                ref: "style.alternativeColor",
                                component: "color-picker",
                                defaultValue: { index: -1, color: "#E4E4E4" },
                                schemaIgnore: true
                              },
                              excludedColor: {
                                label: "Excluded",
                                ref: "style.excludedColor",
                                component: "color-picker",
                                defaultValue: { index: -1, color: "#BEBEBE" },
                                schemaIgnore: true
                              },
                              selectedExcludedColor: {
                                label: "Selected excluded",
                                ref: "style.selectedExcludedColor",
                                component: "color-picker",
                                defaultValue: { index: -1, color: "#A9A9A9" },
                                schemaIgnore: true
                              },
                              possibleColor: {
                                label: "Possible",
                                ref: "style.possibleColor",
                                component: "color-picker",
                                defaultValue: { index: -1, color: "#FFFFFF" },
                                schemaIgnore: true
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  mode: {
                    ref: "props.mode",
                    label: "Hierarchy Mode",
                    type: "string",
                    component: "dropdown",
                    defaultValue: "multiDim",
                    options: [
                      { value: "multiDim", label: "Multi-Dimension" },
                      { value: "parentChild", label: "Parent-Child" }
                    ]
                  },
                  headerText: {
                    ref: "props.headerText",
                    label: "Header text",
                    type: "string",
                    defaultValue: "",
                    expression: "optional"
                  },
                  showSearch: {
                    ref: "props.showSearch",
                    label: "Show search",
                    type: "boolean",
                    component: "switch",
                    defaultValue: true,
                    options: [
                      { value: true, label: "On" },
                      { value: false, label: "Off" }
                    ]
                  },
                  expandLevel: {
                    ref: "props.expandLevel",
                    label: "Default expand",
                    type: "number",
                    component: "dropdown",
                    defaultValue: 1,
                    options: [
                      { value: 10, label: "All collapsed" },
                      { value: 1, label: "Level 1 expanded" },
                      { value: 2, label: "Level 2 expanded" },
                      { value: 3, label: "Level 3 expanded" },
                      { value: -1, label: "All expanded" }
                    ]
                  },
                  showCount: {
                    ref: "props.showCount",
                    label: "Show frequency",
                    type: "boolean",
                    component: "switch",
                    defaultValue: true,
                    options: [
                      { value: true, label: "On" },
                      { value: false, label: "Off" }
                    ]
                  },
                  rowHeight: {
                    ref: "props.rowHeight",
                    label: "Dense view",
                    type: "boolean",
                    component: "switch",
                    defaultValue: false,
                    options: [
                      { value: true, label: "On" },
                      { value: false, label: "Off" }
                    ]
                  }
                }
              },
              treeDisplay: {
                type: "items",
                label: "Tree Display",
                items: {
                  indentPx: {
                    ref: "props.indentPx",
                    label: "Indent size (px)",
                    type: "number",
                    component: "dropdown",
                    defaultValue: 20,
                    options: [
                      { value: 8, label: "8 px" },
                      { value: 12, label: "12 px" },
                      { value: 16, label: "16 px" },
                      { value: 20, label: "20 px" },
                      { value: 28, label: "28 px" },
                      { value: 36, label: "36 px" }
                    ]
                  },
                  iconStyle: {
                    ref: "props.iconStyle",
                    label: "Toggle icon",
                    type: "string",
                    component: "dropdown",
                    defaultValue: "arrow",
                    options: [
                      { value: "arrow", label: "Arrow" },
                      { value: "plusMinus", label: "Plus / Minus" },
                      { value: "folder", label: "Folder" }
                    ]
                  },
                  selectLeafOnly: {
                    ref: "props.selectLeafOnly",
                    label: "Leaf-only selection",
                    type: "boolean",
                    component: "switch",
                    defaultValue: false,
                    options: [
                      { value: true, label: "On" },
                      { value: false, label: "Off" }
                    ]
                  },
                  selectWithChildren: {
                    ref: "props.selectWithChildren",
                    label: "Select with children",
                    type: "boolean",
                    component: "switch",
                    defaultValue: false,
                    options: [
                      { value: true, label: "On" },
                      { value: false, label: "Off" }
                    ],
                    show: function(data) {
                      return data.props && !data.props.selectLeafOnly;
                    }
                  }
                }
              }
            }
          }
        }
      },
      support: {
        snapshot: true,
        export: true,
        exportData: false,
        sharing: true
      }
    };
  }

  // ============================================================
  // Font size / row height maps
  // ============================================================
  var FONT_SIZES = { small: "11px", medium: "13px", large: "15px" };
  var ROW_HEIGHTS = { compact: "26px", normal: "32px", comfortable: "40px" };

  // Module-level caches (survive re-renders)
  var __qhfLatestData = {};     // Latest fetched data per object — always overwritten (keyed by objId)
  var __qhfBaselineData = {};   // Full unfiltered data — keyed by baseline key (no state counts)
  var __qhfPristineBaseline = {}; // Pristine baseline — set ONCE on first no-selection load, NEVER overwritten
  var __qhfFetchSeq = {};       // Fetch sequence counter per object — prevents stale callback renders
  var __qhfSelectUpdating = {}; // Per-object flag: true while waiting for Engine to respond after selection

  // ============================================================
  // Selection guard helpers (mirrors native filter pane pattern)
  // ============================================================
  /** Check if dimension is locked — locked dims cannot be selected */
  function isDimLocked(hc, dimNo) {
    if (!hc || !hc.qDimensionInfo || !hc.qDimensionInfo[dimNo]) return false;
    return !!hc.qDimensionInfo[dimNo].qLocked;
  }

  /** Check if selection is currently allowed (not mid-update, not locked, not in edit mode) */
  function allowedToSelect(objId, constraints, hc, dimNo) {
    // Block if still waiting for Engine to respond to previous selection
    if (__qhfSelectUpdating[objId]) return false;
    // Block if in edit mode
    if (constraints && constraints.passive === true) return false;
    if (constraints && constraints.select === false) return false;
    // Block if dimension is locked
    if (isDimLocked(hc, dimNo)) return false;
    return true;
  }

  // ============================================================
  // Render function (callable from useEffect and fetch callback)
  // ============================================================
  function __qhfDoRender(element) {
    var ctx = element.__qhfRenderCtx;
    if (!ctx) return;
    var layout = ctx.layout;
    var theme = ctx.theme;
    var model = ctx.model;
    var selections = ctx.selections;
    var localState = ctx.localState;
    var constraints = ctx.constraints;
    var expandState = localState.expandState;
    var searchQuery = localState.searchQuery;

    // Paint cycle: reset selectableValuesUpdating (Engine has responded with new layout)
    var baseObjIdForGuard = (layout && layout.qInfo) ? layout.qInfo.qId : "default";
    __qhfSelectUpdating[baseObjIdForGuard] = false;

    // Remove visual loading state
    var existingSelectingEl = element.querySelector(".qhf-selecting");
    if (existingSelectingEl) existingSelectingEl.classList.remove("qhf-selecting");

    // Snapshot cross-dim transition state BEFORE clearing it.
    // During cross-dim, the session is briefly inactive between confirm() and
    // the setTimeout that starts the new session — _crossDimSelected must
    // survive through that gap.
    var wasCrossDimTransition = !!localState._crossDimTransition;

    // Clear cross-dim transition flag after confirm layout arrives
    if (localState._crossDimTransition) {
      localState._crossDimTransition = false;
    }

    // Reset sessionDimNo when no selection session is active
    var selIsActive = selections && selections.isActive && selections.isActive();
    if (!selIsActive) {
      localState.sessionDimNo = -1;
    }

    // Only clear _crossDimSelected when there are truly NO selections in the
    // hypercube. The Qlik framework may deactivate the session (selIsActive=false)
    // while committed selections still exist — in that case the cross-dim hint
    // is still needed because the HyperCube still cross-filters.
    var earlyHc = layout && layout.qHyperCube;
    var earlySelActive = earlyHc ? hasActiveSelections(earlyHc) : false;
    if (!earlySelActive && !wasCrossDimTransition) {
      localState._crossDimSelected = null;
    }

    try {
      injectCSS();

      // Read props
      var props = layout.props || {};
      var mode = props.mode || "multiDim";
      var showSearch = props.showSearch !== false;
      var showCount = !!props.showCount;
      var selectLeafOnly = !!props.selectLeafOnly;
      var singleSelectProp = props.singleSelect;
      // Only enable single-select when explicitly "single" AND not in multiDim mode
      // Native filter pane always uses multi-select, so default to false
      var singleSelectMode = (singleSelectProp === "single" && mode !== "multiDim");
      var selectWithChildren = !!props.selectWithChildren;
      var iconStyle = props.iconStyle || "arrow";
      var indentPx = (typeof props.indentPx === "number") ? props.indentPx : 20;
      var fontSize = FONT_SIZES.medium;
      var denseView = !!props.rowHeight;
      var rowH = denseView ? ROW_HEIGHTS.compact : ROW_HEIGHTS.normal;
      var expandLevelRaw = props.expandLevel !== undefined ? props.expandLevel : 1;
      var expandLevel = (expandLevelRaw === 10) ? 0 : expandLevelRaw;
      if (typeof expandLevel !== "number" || isNaN(expandLevel)) expandLevel = 1;
      var headerText = props.headerText || "";

      // When expandLevel changes, clear the cached expand state so the new default takes effect
      if (localState.prevExpandLevel !== undefined && localState.prevExpandLevel !== expandLevel) {
        localState.expandState = {};
      }
      localState.prevExpandLevel = expandLevel;

      // Theme resolution
      var bgColor = resolveBg(layout, theme);
      var dark = isDarkBg(bgColor);
      var textColor = dark ? "#FFFFFF" : (theme.getStyle("object", "label.name", "color") || "#404040");
      var fontFamily = theme.getStyle("", "", "fontFamily") || "'Source Sans Pro', Arial, sans-serif";
      var accent = resolvePaletteColor(theme, props.accentColor, "#4477AA");

      // --- Read component styling values from layout.components[] ---
      var comps = layout.components || [];
      function getComp(key) {
        for (var ci = 0; ci < comps.length; ci++) {
          if (comps[ci].key === key) return comps[ci];
        }
        return {};
      }
      var headerComp = getComp("header");
      var contentComp = getComp("content");
      var listboxComp = getComp("listbox");
      var headerStyle = (headerComp && headerComp.style) || {};
      var contentStyle = (contentComp && contentComp.style) || {};
      var listboxStyle = (listboxComp && listboxComp.style) || {};

      // Header font from component settings (overrides theme)
      var headerFontFamily = headerStyle.fontFamily || fontFamily;
      var headerFontSize = headerStyle.fontSize || "12px";
      var headerFontStyleArr = headerStyle.fontStyle || ["bold"];
      var headerFontColor = resolvePaletteColor(theme, headerStyle.fontColor, textColor);
      var headerBold = headerFontStyleArr.indexOf("bold") >= 0;
      var headerItalic = headerFontStyleArr.indexOf("italic") >= 0;
      var headerUnderline = headerFontStyleArr.indexOf("underline") >= 0;

      // Content font from component settings (overrides theme)
      var contentFontFamily = contentStyle.fontFamily || fontFamily;
      var contentFontSize = contentStyle.fontSize || fontSize;
      var contentFontStyleArr = contentStyle.fontStyle || [];
      var contentFontColor = resolvePaletteColor(theme, contentStyle.fontColor, textColor);
      var contentBold = contentFontStyleArr.indexOf("bold") >= 0;
      var contentItalic = contentFontStyleArr.indexOf("italic") >= 0;
      var contentUnderline = contentFontStyleArr.indexOf("underline") >= 0;
      var contentAutoContrast = contentStyle.useContrastColor !== false;

      // Selection state colors: component overrides > theme > defaults
      var dataColors = (theme.properties && theme.properties.dataColors) || {};
      var selBg = resolvePaletteColor(theme, listboxStyle.selectedColor, dataColors.selected || "#00873D");
      var altBg = resolvePaletteColor(theme, listboxStyle.alternativeColor, dataColors.alternative || "#E4E4E4");
      var exclBg = resolvePaletteColor(theme, listboxStyle.excludedColor, dataColors.excluded || "#BEBEBE");
      var selExclBg = resolvePaletteColor(theme, listboxStyle.selectedExcludedColor, "#A9A9A9");
      var possibleBg = resolvePaletteColor(theme, listboxStyle.possibleColor, "#FFFFFF");

      // Set CSS custom properties
      element.style.setProperty("--qhf-text", textColor);
      element.style.setProperty("--qhf-font", fontFamily);
      element.style.setProperty("--qhf-font-size", fontSize);
      element.style.setProperty("--qhf-row-h", rowH);
      element.style.setProperty("--qhf-accent", accent);
      element.style.setProperty("--qhf-border", dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)");
      element.style.setProperty("--qhf-hover", dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)");
      element.style.setProperty("--qhf-search-bg", dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.03)");
      element.style.setProperty("--qhf-toggle-color", dark ? "#aaa" : "#888");
      element.style.setProperty("--qhf-count-color", dark ? "#aaa" : "#999");
      // Header font
      element.style.setProperty("--qhf-header-font", headerFontFamily);
      element.style.setProperty("--qhf-header-font-size", headerFontSize);
      element.style.setProperty("--qhf-header-font-weight", headerBold ? "bold" : "normal");
      element.style.setProperty("--qhf-header-font-style", headerItalic ? "italic" : "normal");
      element.style.setProperty("--qhf-header-text-decoration", headerUnderline ? "underline" : "none");
      element.style.setProperty("--qhf-header-color", headerFontColor);
      // Content font
      element.style.setProperty("--qhf-content-font", contentFontFamily);
      element.style.setProperty("--qhf-content-font-size", contentFontSize);
      element.style.setProperty("--qhf-content-font-weight", contentBold ? "bold" : "normal");
      element.style.setProperty("--qhf-content-font-style", contentItalic ? "italic" : "normal");
      element.style.setProperty("--qhf-content-text-decoration", contentUnderline ? "underline" : "none");
      element.style.setProperty("--qhf-content-color", contentFontColor);
      // Selection state colors
      element.style.setProperty("--qhf-sel-bg", selBg);
      element.style.setProperty("--qhf-sel-text", contentAutoContrast ? (isDarkBg(selBg) ? "#FFFFFF" : "#404040") : contentFontColor);
      element.style.setProperty("--qhf-alt-bg", altBg);
      element.style.setProperty("--qhf-alt-text", contentAutoContrast ? (isDarkBg(altBg) ? "#FFFFFF" : "#404040") : contentFontColor);
      element.style.setProperty("--qhf-excl-bg", exclBg);
      element.style.setProperty("--qhf-excl-text", contentAutoContrast ? (isDarkBg(exclBg) ? "#FFFFFF" : "#404040") : contentFontColor);
      element.style.setProperty("--qhf-sel-excl-bg", selExclBg);
      element.style.setProperty("--qhf-sel-excl-text", contentAutoContrast ? (isDarkBg(selExclBg) ? "#FFFFFF" : "#404040") : contentFontColor);
      element.style.setProperty("--qhf-possible-bg", possibleBg);
      element.style.setProperty("--qhf-possible-text", contentAutoContrast ? (isDarkBg(possibleBg) ? "#FFFFFF" : "#404040") : contentFontColor);

      // Store computed text colors as data attributes for inline styling
      var selTextColor = contentAutoContrast ? (isDarkBg(selBg) ? "#FFFFFF" : "#404040") : contentFontColor;
      var altTextColor = contentAutoContrast ? (isDarkBg(altBg) ? "#FFFFFF" : "#404040") : contentFontColor;
      var exclTextColor = contentAutoContrast ? (isDarkBg(exclBg) ? "#FFFFFF" : "#404040") : contentFontColor;
      localState._stateTextColors = { S: selTextColor, A: altTextColor, X: exclTextColor, O: contentFontColor };

      // Validate data
      var hc = layout.qHyperCube;
      if (!hc || !hc.qDimensionInfo || hc.qDimensionInfo.length < 2) {
        element.innerHTML = '<div class="qhf-root"><div class="qhf-placeholder">Add at least 2 dimensions to build the tree</div></div>';
        return;
      }

      var numDims = hc.qDimensionInfo.length;
      if (mode === "parentChild" && numDims < 3) {
        element.innerHTML = '<div class="qhf-root"><div class="qhf-placeholder">Parent-Child mode requires 3 dimensions:<br/>Parent ID, Child ID, Display Name</div></div>';
        return;
      }

      var matrix = (hc.qDataPages && hc.qDataPages[0] && hc.qDataPages[0].qMatrix) || [];

      // ----- Keys & fingerprint -----
      var baseObjId = layout.qInfo ? layout.qInfo.qId : "default";
      var baselineKey = getBaselineKey(layout, hc);
      var selActive = hasActiveSelections(hc);
      // Layout fingerprint: changes when selection state, cardinality, or row count changes
      var layoutFP = hc.qDimensionInfo.map(function(d) {
        var sc = d.qStateCounts || {};
        return d.qFallbackTitle + ":" + d.qCardinal + ":" + (sc.qSelected||0) + "/" + (sc.qOption||0) + "/" + (sc.qExcluded||0) + "/" + (sc.qAlternative||0);
      }).join("|") + "::" + hc.qSize.qcy;

      // If framework didn't provide data pages, use cached data.
      // Prefer fingerprint-matched cache; during active selections also accept
      // mismatched cache to avoid showing a loading spinner (states are overlaid
      // from the layout's qDimensionInfo, so stale row data is acceptable).
      var cached = __qhfLatestData[baseObjId];
      if (matrix.length === 0 && cached && cached.fp === layoutFP) {
        matrix = cached.data;
      }
      if (matrix.length === 0 && hc.qSize && hc.qSize.qcy > 0 && model && selIsActive) {
        // During active selection, the framework often sends layouts without
        // data pages. Fetch in background; in the meantime, use baseline data
        // with stale-aware overlay to approximate the correct visual state.
        var fetchWidth2 = hc.qSize.qcx || numDims;
        var fetchHeight2 = Math.min(hc.qSize.qcy, Math.floor(10000 / fetchWidth2));
        if (!__qhfFetchSeq[baseObjId]) __qhfFetchSeq[baseObjId] = 0;
        __qhfFetchSeq[baseObjId]++;
        var mySeq2 = __qhfFetchSeq[baseObjId];
        var fetchFP2 = layoutFP;
        model.getHyperCubeData("/qHyperCubeDef", [{ qTop: 0, qLeft: 0, qWidth: fetchWidth2, qHeight: fetchHeight2 }]).then(function(pages) {
          if (__qhfFetchSeq[baseObjId] !== mySeq2) return;
          if (pages && pages[0] && pages[0].qMatrix && pages[0].qMatrix.length > 0) {
            __qhfLatestData[baseObjId] = { data: pages[0].qMatrix, fp: fetchFP2 };
            __qhfDoRender(element);
          }
        }).catch(function() {});
        // Use baseline data as matrix so rendering continues (no loading spinner).
        // The overlayStates step will use qDimensionInfo to approximate states;
        // the background fetch will correct them when real data arrives.
        var baseKey2 = getBaselineKey(layout, hc);
        if (__qhfPristineBaseline[baseKey2] && __qhfPristineBaseline[baseKey2].length > 0) {
          matrix = __qhfPristineBaseline[baseKey2];
        } else if (__qhfBaselineData[baseKey2] && __qhfBaselineData[baseKey2].length > 0) {
          matrix = __qhfBaselineData[baseKey2];
        } else if (cached && cached.data && cached.data.length > 0) {
          matrix = cached.data;
        } else {
          return; // No data at all — keep existing DOM
        }
      }
      if (matrix.length === 0 && hc.qSize && hc.qSize.qcy > 0 && model) {
        var fetchWidth = hc.qSize.qcx || numDims;
        var fetchHeight = Math.min(hc.qSize.qcy, Math.floor(10000 / fetchWidth));
        if (!__qhfFetchSeq[baseObjId]) __qhfFetchSeq[baseObjId] = 0;
        __qhfFetchSeq[baseObjId]++;
        var mySeq = __qhfFetchSeq[baseObjId];
        var fetchFP = layoutFP;
        model.getHyperCubeData("/qHyperCubeDef", [{ qTop: 0, qLeft: 0, qWidth: fetchWidth, qHeight: fetchHeight }]).then(function(pages) {
          if (__qhfFetchSeq[baseObjId] !== mySeq) return;
          if (pages && pages[0] && pages[0].qMatrix && pages[0].qMatrix.length > 0) {
            __qhfLatestData[baseObjId] = { data: pages[0].qMatrix, fp: fetchFP };
            __qhfDoRender(element);
          }
        }).catch(function(err) {
          element.innerHTML = '<div class="qhf-root"><div class="qhf-placeholder">Error loading data</div></div>';
        });
        element.innerHTML = '<div class="qhf-root"><div class="qhf-placeholder"><div class="qhf-spinner"></div><span>Loading data\u2026</span></div></div>';
        return;
      }
      // Update cache with current data + fingerprint
      if (matrix.length > 0) {
        __qhfLatestData[baseObjId] = { data: matrix, fp: layoutFP };
      }
      if (matrix.length === 0) {
        element.innerHTML = '<div class="qhf-root"><div class="qhf-placeholder">No data available</div></div>';
        return;
      }

      // ----- Baseline management -----
      // Pristine baseline: stored ONCE on first load with no active selections,
      // NEVER overwritten. This protects against race conditions during cross-dim
      // transitions where an intermediate layout could overwrite the baseline with
      // filtered (post-commit) data.
      if (!selActive && matrix.length > 0 && !__qhfPristineBaseline[baselineKey]) {
        __qhfPristineBaseline[baselineKey] = matrix;
      }
      // Regular baseline: updated whenever no selections are active
      if (!selActive) {
        __qhfBaselineData[baselineKey] = matrix;
      } else if (!__qhfBaselineData[baselineKey]) {
        // Selections active but no baseline yet — use current data as fallback baseline
        // (will be replaced when user clears selections)
        __qhfBaselineData[baselineKey] = matrix;
      }

      // Prefer pristine baseline (guaranteed full data) over regular baseline
      var baselineMatrix = __qhfPristineBaseline[baselineKey] || __qhfBaselineData[baselineKey];

      // Safety check: if the baseline has fewer rows than expected (was stored
      // from filtered data), and the current matrix has more rows AND no selections,
      // fix the baseline now.
      if (!selActive && matrix.length > 0 && baselineMatrix && matrix.length > baselineMatrix.length) {
        __qhfPristineBaseline[baselineKey] = matrix;
        __qhfBaselineData[baselineKey] = matrix;
        baselineMatrix = matrix;
      }

      // If this render was triggered by onCanceled, treat selections as inactive
      // BUT: when committed selections exist (selActive=true from qStateCounts),
      // the HyperCube is cross-filtered and we MUST use baseline+overlay to show
      // all values. Only force effectiveSelActive=false when truly no selections.
      var effectiveSelActive = selActive;
      if (localState._cancelledRender) {
        if (!selActive) {
          effectiveSelActive = false;
        }
        localState._cancelledRender = false;
      }

      // USE BASELINE whenever we have one AND *any* indication that selections
      // are in play — committed selections (selActive / effectiveSelActive),
      // an open selection session (selIsActive), or an ongoing cross-dim
      // transition. This prevents the tree from being built from cross-filtered
      // HyperCube data during intermediate render cycles.
      var useBaseline = baselineMatrix && (effectiveSelActive || selIsActive || wasCrossDimTransition);

      // ----- Build tree -----
      var roots;
      if (mode === "parentChild") {
        roots = buildTreeParentChild(matrix);
        // TODO: baseline overlay for parent-child mode
      } else {
        if (useBaseline) {
          // Build full tree from baseline (all values always visible)
          roots = buildTreeMultiDim(baselineMatrix, numDims);
          // Build state map from current data (may be same as baseline if
          // we used baseline as fallback when framework omitted data pages)
          var stateMap = buildStateMap(matrix, numDims);
          // If matrix IS the baseline (no real data available), the stateMap
          // will have all "O" values — mark it stale so overlayStates uses
          // qDimensionInfo.qStateCounts to infer correct states.
          var isStaleMap = (matrix === baselineMatrix);
          // Overlay current selection states onto baseline tree.
          // Pass _crossDimSelected so the just-clicked cross-dim value shows as "S"
          // even though the HyperCube cross-filters it out of the engine data.
          // The hint persists until the selection session ends (cleared in the
          // session-inactive cleanup above).
          overlayStates(roots, stateMap, 0, hc.qDimensionInfo, isStaleMap, localState._crossDimSelected || null);
        } else {
          // No selections or no baseline — build directly from current data
          roots = buildTreeMultiDim(matrix, numDims);
        }
      }

      // Apply search filter
      var displayRoots = roots;
      if (searchQuery) {
        displayRoots = filterTree(roots, searchQuery);
      }

      // Store current roots on localState so popup click handlers
      // (which capture stale closures) can read fresh state data.
      localState.currentRoots = roots;
      localState.currentDisplayRoots = displayRoots;

      // ---- Shared callbacks for toggle/select (used by both normal and popup mode) ----
      var onToggleFn = function(nodeId) {
        if (localState.expandState.hasOwnProperty(nodeId)) {
          localState.expandState[nodeId] = !localState.expandState[nodeId];
        } else {
          function findNodeT(nodes) {
            for (var i = 0; i < nodes.length; i++) {
              if (nodes[i].id === nodeId) return nodes[i];
              var found = findNodeT(nodes[i].children);
              if (found) return found;
            }
            return null;
          }
          var targetNode = findNodeT(displayRoots);
          var wasExpanded;
          if (targetNode) {
            if (searchQuery) { wasExpanded = true; }
            else if (expandLevel === -1) { wasExpanded = true; }
            else { wasExpanded = targetNode.depth < expandLevel; }
          } else { wasExpanded = true; }
          localState.expandState[nodeId] = !wasExpanded;
        }
      };

      var onSelectFn = function(node) {
        // --- Selection guards (mirrors native filter pane) ---
        var dimNo = node.dimIndex;
        if (!allowedToSelect(baseObjId, constraints, hc, dimNo)) return;

        if (selectLeafOnly && node.children && node.children.length > 0) {
          onToggleFn(node.id);
          return;
        }

        var clickedElems;
        if (selectWithChildren && node.children && node.children.length > 0) {
          clickedElems = collectElemNumbers(node, dimNo);
        } else {
          clickedElems = [node.qElemNumber];
        }

        if (clickedElems.length > 0 && model) {
          // Mark as updating — blocks further selections until next paint cycle
          __qhfSelectUpdating[baseObjId] = true;

          // Show visual loading state (throbber effect)
          var qhfRootEl = element.querySelector(".qhf-root") || (localState.popupEl ? localState.popupEl.querySelector(".qhf-popup") : null);
          if (qhfRootEl) qhfRootEl.classList.add("qhf-selecting");

          var isAlreadyInSession = selections && selections.isActive && selections.isActive();
          var currentSessionDim = localState.sessionDimNo;

          // --- Cross-dimension selection: auto-confirm previous, then select new ---
          // In a hierarchy tree, users expect to click any level in a single click.
          // We confirm the previous dimension's session and immediately start a new one.
          if (isAlreadyInSession && currentSessionDim >= 0 && currentSessionDim !== dimNo) {
            localState._crossDimTransition = true;
            localState.sessionDimNo = -1;
            // Store cross-dim click target so overlayStates can mark it "S"
            // even when the HyperCube cross-filters it out of fetched data.
            localState._crossDimSelected = { text: node.text, dimLevel: dimNo, qElemNumbers: clickedElems.slice() };
            if (selections && typeof selections.confirm === "function") {
              try {
                selections.confirm();
              } catch(e) { /* ok */ }
            }
            // After confirm, wait for session to deactivate, then start new session + select
            // Use a short delay to allow the Engine to process the confirm
            var crossDimClickedElems = clickedElems.slice();
            var crossDimDimNo = dimNo;
            setTimeout(function() {
              // Recollect currently selected for the NEW dimension (post-confirm state)
              var freshRoots = localState.currentRoots || roots;
              var freshSelected = collectSelectedElems(freshRoots, crossDimDimNo);
              var freshMerged = [];
              for (var fi = 0; fi < freshSelected.length; fi++) freshMerged.push(freshSelected[fi]);
              for (var fj = 0; fj < crossDimClickedElems.length; fj++) {
                var fidx = freshMerged.indexOf(crossDimClickedElems[fj]);
                if (fidx >= 0) freshMerged.splice(fidx, 1);
                else freshMerged.push(crossDimClickedElems[fj]);
              }
              if (singleSelectMode) freshMerged = crossDimClickedElems;
              if (freshMerged.length === 0) {
                __qhfSelectUpdating[baseObjId] = false;
                return;
              }
              localState.sessionDimNo = crossDimDimNo;
              var doCrossDimSelect = function() {
                model.selectHyperCubeValues("/qHyperCubeDef", crossDimDimNo, freshMerged, false).then(function(qSuccess) {
                  if (qSuccess === false) {
                    if (selections && typeof selections.cancel === "function") selections.cancel();
                    localState.sessionDimNo = -1;
                  }
                  __qhfSelectUpdating[baseObjId] = false;
                }).catch(function(err) {
                  __qhfSelectUpdating[baseObjId] = false;
                });
              };
              if (selections && typeof selections.begin === "function") {
                try {
                  selections.begin("/qHyperCubeDef").then(function() {
                    doCrossDimSelect();
                  }).catch(function() { doCrossDimSelect(); });
                } catch(e) { doCrossDimSelect(); }
              } else {
                doCrossDimSelect();
              }
            }, 300);
            return;
          }

          // --- Same-dimension selection: merge clicked with existing ---
          // Detect "implicit cross-dim": no active session but committed
          // selections exist on OTHER dimensions.  The HyperCube will cross-
          // filter the matrix, so the just-clicked value may be absent from
          // engine data.  Store a _crossDimSelected hint exactly like the
          // explicit cross-dim handler so overlayStates can mark it "S".
          if (!isAlreadyInSession && hc && hc.qDimensionInfo) {
            for (var cdi = 0; cdi < hc.qDimensionInfo.length; cdi++) {
              if (cdi !== dimNo) {
                var cdSc = hc.qDimensionInfo[cdi].qStateCounts || {};
                if ((cdSc.qSelected || 0) > 0) {
                  localState._crossDimSelected = { text: node.text, dimLevel: dimNo, qElemNumbers: clickedElems.slice() };
                  break;
                }
              }
            }
          } else if (isAlreadyInSession) {
            // Same-dim click within active session: clear the stale cross-dim
            // hint from a previous click.  But if committed selections still
            // exist on OTHER dimensions the HyperCube is still cross-filtered
            // so we need to UPDATE the hint to the newly clicked value (not
            // clear it), otherwise overlayStates won't mark it green.
            var stillCrossDim = false;
            if (hc && hc.qDimensionInfo) {
              for (var cdi2 = 0; cdi2 < hc.qDimensionInfo.length; cdi2++) {
                if (cdi2 !== dimNo) {
                  var cdSc2 = hc.qDimensionInfo[cdi2].qStateCounts || {};
                  if ((cdSc2.qSelected || 0) > 0) { stillCrossDim = true; break; }
                }
              }
            }
            if (stillCrossDim) {
              localState._crossDimSelected = { text: node.text, dimLevel: dimNo, qElemNumbers: clickedElems.slice() };
            } else {
              localState._crossDimSelected = null;
            }
          }

          var currentSelected = collectSelectedElems(localState.currentRoots || roots, dimNo);
          var merged = [];
          for (var i = 0; i < currentSelected.length; i++) merged.push(currentSelected[i]);
          for (var j = 0; j < clickedElems.length; j++) {
            var idx = merged.indexOf(clickedElems[j]);
            if (idx >= 0) merged.splice(idx, 1);
            else merged.push(clickedElems[j]);
          }
          if (singleSelectMode) merged = clickedElems;

          var doSelect = function() {
            if (merged.length === 0) {
              // Deselecting the last value → clear this dimension's selection.
              // Do NOT call selections.cancel() here — cancel reverts to the
              // previously confirmed state (bringing all values back).
              // Instead, use model.clearSelections to actually clear the field.
              if (model.clearSelections) {
                model.clearSelections("/qHyperCubeDef", [dimNo]).then(function() {
                  __qhfSelectUpdating[baseObjId] = false;
                }).catch(function(err) {
                  console.warn("qhf clearSelections error:", err);
                  if (isAlreadyInSession && selections && typeof selections.cancel === "function") {
                    selections.cancel();
                  }
                  localState.sessionDimNo = -1;
                  __qhfSelectUpdating[baseObjId] = false;
                });
              } else {
                // Fallback for engines without clearSelections
                if (isAlreadyInSession && selections && typeof selections.cancel === "function") {
                  selections.cancel();
                }
                localState.sessionDimNo = -1;
                __qhfSelectUpdating[baseObjId] = false;
              }
              return;
            }
            model.selectHyperCubeValues("/qHyperCubeDef", dimNo, merged, false).then(function(qSuccess) {
              // --- Failure handling (mirrors native) ---
              if (qSuccess === false) {
                // Engine rejected selection
                if (selections && typeof selections.cancel === "function") {
                  selections.cancel();
                }
                localState.sessionDimNo = -1;
                __qhfSelectUpdating[baseObjId] = false;
              }
              // Success: flag will be cleared on next paint cycle (line 944),
              // but also clear here to unblock rapid clicks before next paint
              __qhfSelectUpdating[baseObjId] = false;
            }).catch(function(err) { console.warn("qhf selection error:", err); __qhfSelectUpdating[baseObjId] = false; });
          };

          if (selections && typeof selections.begin === "function") {
            if (isAlreadyInSession) {
              doSelect();
            } else {
              localState.sessionDimNo = dimNo;
              try { selections.begin("/qHyperCubeDef").then(function() { doSelect(); }).catch(function() { doSelect(); }); }
              catch(e) { doSelect(); }
            }
          } else { doSelect(); }
        }
      };

      // ---- Collapsed / Popup detection ----
      var COLLAPSED_THRESHOLD = 90; // px — below this height, show collapsed bar with popup
      var containerHeight = element.clientHeight || element.offsetHeight || 0;
      var isCollapsed = containerHeight > 0 && containerHeight < COLLAPSED_THRESHOLD;

      // Store callbacks on localState so popup click handlers (from
      // the initial popup render) can always call the latest version.
      localState.currentOnSelect = onSelectFn;
      localState.currentOnToggle = onToggleFn;

      // Build header text for both modes
      var displayHeader = headerText;
      if (!displayHeader && hc.qDimensionInfo.length > 0) {
        displayHeader = hc.qDimensionInfo.map(function(d) { return d.qFallbackTitle; }).join(" / ");
      }

      // ---- Helper: close any open popup ----
      function closePopupIfOpen() {
        if (localState.popupOverlayEl && localState.popupOverlayEl.parentNode) {
          localState.popupOverlayEl.parentNode.removeChild(localState.popupOverlayEl);
        }
        if (localState.popupEl && localState.popupEl.parentNode) {
          localState.popupEl.parentNode.removeChild(localState.popupEl);
        }
        localState.popupEl = null;
        localState.popupOverlayEl = null;
        // Clear search state so reopening shows the full unfiltered tree
        localState.searchQuery = "";
        localState.popupSearchOpen = false;
        if (localState.searchTimer) { clearTimeout(localState.searchTimer); localState.searchTimer = null; }
      }

      // ---- Helper: build selection summary text ----
      function buildSelSummary() {
        if (!hc.qDimensionInfo) return "";
        var parts = [];
        for (var di = 0; di < hc.qDimensionInfo.length; di++) {
          var sc = hc.qDimensionInfo[di].qStateCounts || {};
          if (sc.qSelected > 0) parts.push(sc.qSelected + " of " + hc.qDimensionInfo[di].qCardinal);
        }
        return parts.length > 0 ? " (" + parts.join(", ") + ")" : "";
      }

      // ---- Helper: build popup render opts (always uses fresh roots/displayRoots) ----
      function makePopupRenderOpts() {
        var opts = {
          expandState: expandState,
          expandLevel: expandLevel,
          indentPx: indentPx,
          iconStyle: iconStyle,
          showCount: showCount,
          searchQuery: localState.searchQuery,
          stateTextColors: localState._stateTextColors,
          onToggle: function(nodeId) {
            // Delegate to latest toggle function via localState
            (localState.currentOnToggle || onToggleFn)(nodeId);
            // Re-render tree inside popup immediately (toggle is local, no layout change)
            var freshR = localState.currentRoots || roots;
            var freshD = localState.currentDisplayRoots || displayRoots;
            var curRoots = localState.searchQuery ? filterTree(freshR, localState.searchQuery) : freshD;
            if (localState.popupEl) renderTree(localState.popupEl, curRoots, makePopupRenderOpts());
          },
          onSelect: function(node) {
            // ---- Immediate optimistic visual feedback (matches native Qlik) ----
            // The backend render cycle can be delayed or skip-patched; update
            // the popup DOM instantly so the user sees feedback on click.
            var popupC = localState.popupEl;
            if (popupC) {
              var clickedRow = popupC.querySelector('[data-node-id="' + node.id + '"]');
              if (clickedRow) {
                // Collect all rows for the unselect-all-clear logic below
                var allRows = popupC.querySelectorAll(".qhf-node[data-node-id]");
                // NOTE: Do NOT clear other selected items here.  Qlik uses
                // multi-select (toggle): clicking a second value adds it to
                // the selection.  Previously selected items must stay green.
                // The engine render will overlay the correct states for all
                // rows once the backend responds.

                // Toggle the clicked row
                var wasSelected = clickedRow.classList.contains("qhf-selected");
                clickedRow.classList.remove("qhf-selected", "qhf-excluded", "qhf-alternative");
                if (!wasSelected) {
                  // SELECT: clear any pending instant-clear suppression so the
                  // new selection isn't accidentally forced to "O"
                  localState._instantClearTs = 0;
                  // Track pending selection so stale engine renders don't
                  // overwrite the instant feedback before the engine confirms.
                  if (!localState._pendingSelects) localState._pendingSelects = {};
                  localState._pendingSelects[node.text] = Date.now();
                  clickedRow.classList.add("qhf-selected");
                  clickedRow.setAttribute("aria-selected", "true");
                  var cTick = clickedRow.querySelector(".qhf-tick");
                  if (cTick) cTick.style.opacity = "1";
                  // Inline text color for auto-contrast
                  var _stc = localState._stateTextColors || {};
                  applyInlineTextColor(clickedRow, _stc.S || "#FFFFFF");

                  // Instant feedback for ALL other items: mark non-selected
                  // rows as alternative (light grey) immediately, matching
                  // native Qlik behavior. Already-selected items stay green.
                  // The engine render will correct the exact states (A vs X)
                  // within ~100-200ms.
                  for (var ai = 0; ai < allRows.length; ai++) {
                    if (allRows[ai] === clickedRow) continue;
                    if (allRows[ai].classList.contains("qhf-selected")) continue;
                    allRows[ai].classList.remove("qhf-excluded");
                    if (!allRows[ai].classList.contains("qhf-alternative")) {
                      allRows[ai].classList.add("qhf-alternative");
                      applyInlineTextColor(allRows[ai], _stc.A || "#404040");
                    }
                  }
                } else {
                  // UNSELECT: clear the clicked row; remove from pending selects
                  if (localState._pendingSelects) delete localState._pendingSelects[node.text];
                  clickedRow.setAttribute("aria-selected", "false");
                  var cTick2 = clickedRow.querySelector(".qhf-tick");
                  if (cTick2) cTick2.style.opacity = "0";
                  // Check if ANY other items (at any level) remain selected.
                  var anyStillSelected = false;
                  for (var si = 0; si < allRows.length; si++) {
                    if (allRows[si] === clickedRow) continue;
                    if (allRows[si].classList.contains("qhf-selected")) {
                      anyStillSelected = true;
                      break;
                    }
                  }
                  var _stc2 = localState._stateTextColors || {};
                  if (anyStillSelected) {
                    // Other items still selected — mark the deselected row as
                    // alternative (light grey) immediately
                    clickedRow.classList.add("qhf-alternative");
                    applyInlineTextColor(clickedRow, _stc2.A || "#404040");
                  } else {
                    // Clear deselected row colors
                    applyInlineTextColor(clickedRow, "");
                  }
                  if (!anyStillSelected) {
                    // No selections remain anywhere — clear all alternative/excluded
                    // classes so everything goes back to white (the engine will confirm).
                    // ALSO set a suppression timestamp so the next engine render(s) don't
                    // re-apply stale excluded states before the engine confirms the clear.
                    localState._instantClearTs = Date.now();
                    for (var ci = 0; ci < allRows.length; ci++) {
                      allRows[ci].classList.remove("qhf-selected", "qhf-excluded", "qhf-alternative");
                      allRows[ci].setAttribute("aria-selected", "false");
                      applyInlineTextColor(allRows[ci], "");
                      var ciTick = allRows[ci].querySelector(".qhf-tick");
                      if (ciTick) ciTick.style.opacity = "0";
                    }
                  }
                }
              }
            }
            // Delegate to actual selection handler (async engine call)
            (localState.currentOnSelect || onSelectFn)(node);
          },
          selections: selections,
          localState: localState,
          closePopup: closePopupIfOpen
        };
        return opts;
      }

      // ---- Helper: open or refresh popup ----
      function openOrRefreshPopup(anchorEl) {
        // If popup already exists, just refresh the tree inside it
        if (localState.popupEl && localState.popupEl.parentNode) {
          // SAFETY: If the popup is open and we have a baseline, ALWAYS
          // rebuild from baseline + overlay. This prevents the popup from
          // ever showing a reduced tree, regardless of what the main render
          // cycle stored in localState.currentRoots.
          var freshRoots = localState.currentRoots || roots;
          if (baselineMatrix && mode !== "parentChild") {
            var safeRoots = buildTreeMultiDim(baselineMatrix, numDims);
            var safeStateMap = buildStateMap(matrix, numDims);
            var safeStale = (matrix === baselineMatrix);
            overlayStates(safeRoots, safeStateMap, 0, hc.qDimensionInfo, safeStale, localState._crossDimSelected || null);
            freshRoots = safeRoots;
            // Update localState so subsequent refreshes also use full tree
            localState.currentRoots = safeRoots;

            // SUPPRESSION: if instant-feedback just cleared all rows (unselect-last),
            // the engine may still send stale renders with excluded/selected states.
            // Force everything to "O" so the popup stays white until the engine
            // confirms the clear. The flag is cleared when the user makes a NEW
            // selection (in the SELECT branch of instant feedback), so new
            // selections won't be accidentally suppressed.
            if (localState._instantClearTs && (Date.now() - localState._instantClearTs < 2000)) {
              function _forceO(ns) {
                for (var fi = 0; fi < ns.length; fi++) {
                  ns[fi].qState = "O";
                  if (ns[fi].children) _forceO(ns[fi].children);
                }
              }
              _forceO(safeRoots);
            }

            // PENDING SELECTS: if the user just clicked items to select them,
            // stale engine renders may still show those items as "A" or "X".
            // Force pending items to "S" so the instant feedback isn't lost.
            // Items are auto-cleared once the engine confirms (state === "S")
            // or after a 3-second timeout.
            if (localState._pendingSelects) {
              var now = Date.now();
              var pendingTexts = Object.keys(localState._pendingSelects);
              for (var pi = 0; pi < pendingTexts.length; pi++) {
                var pText = pendingTexts[pi];
                var pTs = localState._pendingSelects[pText];
                if (now - pTs > 3000) {
                  delete localState._pendingSelects[pText];
                  continue;
                }
                // Walk tree and force matching node to "S"
                (function _forceSel(ns) {
                  for (var si = 0; si < ns.length; si++) {
                    if (ns[si].text === pText) {
                      if (ns[si].qState === "S") {
                        // Engine confirmed — clear pending
                        delete localState._pendingSelects[pText];
                      } else {
                        ns[si].qState = "S";
                      }
                    }
                    if (ns[si].children) _forceSel(ns[si].children);
                  }
                })(safeRoots);
              }
            }
          }
          var freshDisplay = freshRoots;
          var curRoots = localState.searchQuery ? filterTree(freshRoots, localState.searchQuery) : freshDisplay;
          var pOpts = makePopupRenderOpts();
          // NEVER skip rebuild in popup — if patchTreeStates detects a structural
          // mismatch (e.g. DOM reduced to 3 nodes but tree has 22), we MUST rebuild.
          // The patchTreeStates bidirectional count check now catches these cases.
          localState._lastPopupFP = layoutFP;
          renderTree(localState.popupEl, curRoots, pOpts);
          // Also patch the collapsed selection bar if present
          var existingBar = anchorEl && anchorEl.querySelector ? anchorEl.querySelector(".qhf-collapsed-selbar") : null;
          if (!existingBar) existingBar = element.querySelector(".qhf-collapsed-selbar");
          if (existingBar) patchCollapsedSelBar(existingBar, hc);
          return;
        }

        // Create overlay to capture outside clicks
        var overlay = document.createElement("div");
        overlay.className = "qhf-popup-overlay";

        // Create popup
        var popup = document.createElement("div");
        popup.className = "qhf-popup";

        // Inherit CSS custom properties on popup
        popup.style.setProperty("--qhf-text", textColor);
        popup.style.setProperty("--qhf-font", fontFamily);
        popup.style.setProperty("--qhf-font-size", fontSize);
        popup.style.setProperty("--qhf-row-h", rowH);
        popup.style.setProperty("--qhf-accent", accent);
        popup.style.setProperty("--qhf-border", dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)");
        popup.style.setProperty("--qhf-hover", dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)");
        popup.style.setProperty("--qhf-search-bg", dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.03)");
        popup.style.setProperty("--qhf-toggle-color", dark ? "#aaa" : "#888");
        popup.style.setProperty("--qhf-count-color", dark ? "#aaa" : "#999");
        popup.style.setProperty("--qhf-sel-bg", selBg);
        popup.style.setProperty("--qhf-sel-text", contentAutoContrast ? (isDarkBg(selBg) ? "#FFFFFF" : "#404040") : contentFontColor);
        popup.style.setProperty("--qhf-alt-bg", altBg);
        popup.style.setProperty("--qhf-alt-text", contentAutoContrast ? (isDarkBg(altBg) ? "#FFFFFF" : "#404040") : contentFontColor);
        popup.style.setProperty("--qhf-excl-bg", exclBg);
        popup.style.setProperty("--qhf-excl-text", contentAutoContrast ? (isDarkBg(exclBg) ? "#FFFFFF" : "#404040") : contentFontColor);
        popup.style.setProperty("--qhf-sel-excl-bg", selExclBg);
        popup.style.setProperty("--qhf-sel-excl-text", contentAutoContrast ? (isDarkBg(selExclBg) ? "#FFFFFF" : "#404040") : contentFontColor);
        popup.style.setProperty("--qhf-possible-bg", possibleBg);
        popup.style.setProperty("--qhf-possible-text", contentAutoContrast ? (isDarkBg(possibleBg) ? "#FFFFFF" : "#404040") : contentFontColor);
        popup.style.setProperty("--qhf-content-color", contentFontColor);
        if (dark) {
          popup.style.background = bgColor;
          popup.style.color = textColor;
        }

        // Position popup below the anchor
        var anchorRect = anchorEl.getBoundingClientRect();
        popup.style.left = anchorRect.left + "px";
        popup.style.top = (anchorRect.bottom + 2) + "px";
        popup.style.width = Math.max(anchorRect.width, 260) + "px";

        // Popup header — native pattern: title + action buttons (More, Cancel, Confirm)
        var popupHdr = document.createElement("div");
        popupHdr.className = "qhf-popup-header";

        var popupTitle = document.createElement("span");
        popupTitle.className = "qhf-popup-header-title";
        popupTitle.textContent = displayHeader || "Filter";
        popupHdr.appendChild(popupTitle);

        // Header action buttons (native: More ⋯ , Clear/Cancel ✕, Confirm ✓)
        function makeHdrBtn(title, svgContent, onClick) {
          var btn = document.createElement("button");
          btn.className = "qhf-popup-hdr-btn";
          btn.title = title;
          btn.innerHTML = svgContent;
          btn.addEventListener("click", function(ev) { ev.stopPropagation(); onClick(); });
          return btn;
        }
        // Cancel / close button (X)
        popupHdr.appendChild(makeHdrBtn("Cancel selection",
          "<svg viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round'><line x1='4' y1='4' x2='12' y2='12'/><line x1='12' y1='4' x2='4' y2='12'/></svg>",
          function() { closePopupIfOpen(); }
        ));
        // Confirm button (checkmark)
        popupHdr.appendChild(makeHdrBtn("Confirm selection",
          "<svg viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><polyline points='3 8.5 6.5 12 13 4'/></svg>",
          function() { closePopupIfOpen(); }
        ));
        popup.appendChild(popupHdr);

        // Popup search — ALWAYS visible, native pattern (search icon + input)
        var pSearchRow = document.createElement("div");
        pSearchRow.className = "qhf-popup-search";
        var pSearchIcon = document.createElement("div");
        pSearchIcon.className = "qhf-popup-search-icon";
        pSearchIcon.innerHTML = "<svg width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='1.5'><circle cx='7' cy='7' r='5'/><line x1='11' y1='11' x2='14' y2='14'/></svg>";
        pSearchRow.appendChild(pSearchIcon);
        var pSearchInput = document.createElement("input");
        pSearchInput.type = "text";
        pSearchInput.placeholder = "Search in listbox";
        pSearchInput.value = localState.searchQuery || "";
        pSearchInput.addEventListener("input", function(ev2) {
          var val = ev2.target.value;
          if (localState.searchTimer) clearTimeout(localState.searchTimer);
          localState.searchTimer = setTimeout(function() {
            localState.searchQuery = val;
            var freshR = localState.currentRoots || roots;
            var freshD = localState.currentDisplayRoots || displayRoots;
            var filteredRoots = val ? filterTree(freshR, val) : freshD;
            if (localState.popupEl) renderTree(localState.popupEl, filteredRoots, makePopupRenderOpts());
          }, 200);
        });
        pSearchInput.addEventListener("keydown", function(ev3) {
          if (ev3.key === "Escape") {
            ev3.preventDefault();
            ev3.stopPropagation();
            if (localState.searchQuery) {
              pSearchInput.value = "";
              localState.searchQuery = "";
              if (localState.searchTimer) clearTimeout(localState.searchTimer);
              renderTree(popup, localState.currentDisplayRoots || displayRoots, makePopupRenderOpts());
            } else {
              closePopupIfOpen();
            }
            return;
          }
          if (ev3.key === "Tab") {
            ev3.preventDefault();
            ev3.stopPropagation();
            var firstNode = popup.querySelector(".qhf-node");
            if (firstNode) firstNode.focus();
            return;
          }
          ev3.stopPropagation();
        });
        pSearchRow.appendChild(pSearchInput);
        popup.appendChild(pSearchRow);

        // Popup tree scroll container
        var pScrollContainer = document.createElement("div");
        pScrollContainer.className = "qhf-tree-scroll";
        popup.appendChild(pScrollContainer);

        // Render tree into popup — ALWAYS use baseline if available
        // so the popup never opens with a reduced/filtered tree.
        var popupInitRoots = displayRoots;
        if (baselineMatrix && mode !== "parentChild") {
          var initRoots = buildTreeMultiDim(baselineMatrix, numDims);
          var initStateMap = buildStateMap(matrix, numDims);
          var initStale = (matrix === baselineMatrix);
          overlayStates(initRoots, initStateMap, 0, hc.qDimensionInfo, initStale, localState._crossDimSelected || null);
          popupInitRoots = localState.searchQuery ? filterTree(initRoots, localState.searchQuery) : initRoots;
          localState.currentRoots = initRoots;
        }
        renderTree(popup, popupInitRoots, makePopupRenderOpts());

        // Store references
        localState.popupEl = popup;
        localState.popupOverlayEl = overlay;

        overlay.addEventListener("click", function() {
          closePopupIfOpen();
        });

        // Keyboard: Escape on popup closes it
        popup.addEventListener("keydown", function(ev4) {
          if (ev4.key === "Escape") {
            ev4.preventDefault();
            ev4.stopPropagation();
            closePopupIfOpen();
          }
        });

        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        // Adjust position if off-screen
        requestAnimationFrame(function() {
          var popRect = popup.getBoundingClientRect();
          if (popRect.bottom > window.innerHeight - 10) {
            popup.style.top = "";
            popup.style.bottom = (window.innerHeight - anchorRect.top) + "px";
          }
          if (popRect.right > window.innerWidth - 10) {
            popup.style.left = Math.max(10, window.innerWidth - popRect.width - 10) + "px";
          }
          // Focus search input (always visible in popup)
          var pInp = popup.querySelector(".qhf-popup-search input");
          if (pInp) {
            pInp.focus();
          } else {
            var fn = popup.querySelector(".qhf-node");
            if (fn) fn.focus();
          }
        });
      }

      // ---- COLLAPSED MODE: show compact bar, open popup on click ----
      // If popup is open, ALWAYS treat as collapsed (popup should stay open during selections)
      var popupIsOpen = localState.popupEl && localState.popupEl.parentNode;
      if (isCollapsed || popupIsOpen) {
        // If popup is open, refresh its tree content with new data (patch-only)
        if (popupIsOpen) {
          openOrRefreshPopup(element);
        }

        // --- Collapsed bar: build once, then patch selection segments in-place ---
        var existingBar = element.querySelector(".qhf-collapsed-bar");
        if (existingBar) {
          // Patch: only update the selection segment colors (no DOM rebuild)
          var existingSelBar = existingBar.querySelector(".qhf-collapsed-selbar");
          if (existingSelBar) {
            patchCollapsedSelBar(existingSelBar, hc);
          }
          return; // Don't rebuild — just patched
        }

        // First render: build the collapsed bar from scratch
        element.innerHTML = "";
        var bar = document.createElement("div");
        bar.className = "qhf-collapsed-bar";
        bar.style.background = bgColor;
        bar.style.setProperty("--qhf-text", textColor);
        bar.style.setProperty("--qhf-font", fontFamily);

        var barTitle = document.createElement("div");
        barTitle.className = "qhf-collapsed-title";
        barTitle.textContent = displayHeader || "Filter";
        bar.appendChild(barTitle);

        // Colored selection bar — segments proportional to state counts
        var selBar = document.createElement("div");
        selBar.className = "qhf-collapsed-selbar";
        patchCollapsedSelBar(selBar, hc);
        bar.appendChild(selBar);

        bar.addEventListener("click", function(e) {
          e.stopPropagation();
          openOrRefreshPopup(bar);
        });

        element.appendChild(bar);
        return; // Don't render the full tree inline
      }

      // If switching from collapsed to normal mode, close any open popup
      closePopupIfOpen();

      // ---- NORMAL MODE: try DOM patching first (avoids flash on selection) ----
      var existingRoot = element.querySelector(".qhf-root");
      if (existingRoot && !searchQuery && existingRoot.querySelector(".qhf-tree-scroll")) {
        var _patchResult = patchTreeStates(existingRoot, displayRoots);
        if (_patchResult) {
          existingRoot.style.background = bgColor;
          // Update search toggle active state and search wrap visibility
          var stBtn = existingRoot.querySelector(".qhf-search-toggle");
          if (stBtn) {
            stBtn.classList.toggle("qhf-search-active", !!(localState.searchOpen || searchQuery));
          }
          var swrap = existingRoot.querySelector(".qhf-search-wrap");
          if (swrap) {
            swrap.classList.toggle("qhf-search-open", !!(localState.searchOpen || searchQuery));
          }
          localState._lastRenderedFP = layoutFP;
          return; // Successfully patched — skip full rebuild
        }
        // Patching failed — if the layout fingerprint hasn't changed since
        // the last successful render, this is a duplicate/stale intermediate
        // render from the framework. Skip the rebuild to avoid flash/scroll-reset.
        // But if the fingerprint DID change, we have genuinely new data and
        // must rebuild to reflect the updated state.
        if (selIsActive && localState._lastRenderedFP === layoutFP) {
          return; // Duplicate render — keep current DOM
        }
      }

      // ---- NORMAL MODE: full rebuild ----
      // Save scroll position before rebuild
      var prevScrollContainer = element.querySelector(".qhf-tree-scroll");
      var savedInlineScroll = prevScrollContainer ? prevScrollContainer.scrollTop : 0;
      // Save focus + caret so a rebuild triggered while the user is typing
      // doesn't kick them out of the search box
      var _ae = document.activeElement;
      var _searchWasFocused = !!(_ae && _ae.classList && _ae.classList.contains("qhf-search") && element.contains(_ae));
      var _searchSelStart = _searchWasFocused ? _ae.selectionStart : null;
      var _searchSelEnd = _searchWasFocused ? _ae.selectionEnd : null;
      // Same for a keyboard-focused tree row — renderTree can't recover this
      // one itself, because element.innerHTML below detaches it before
      // renderTree ever runs
      var _focusedNodeId = captureFocusedNodeId(element);
      element.innerHTML = "";
      var rootEl = document.createElement("div");
      rootEl.className = "qhf-root";
      rootEl.setAttribute("role", "tree");
      rootEl.style.background = bgColor;
      element.appendChild(rootEl);

      // Header with search toggle icon
      var hdr = document.createElement("div");
      hdr.className = "qhf-header";
      // Magnifying glass search toggle button — LEFT of title (native pattern)
      if (showSearch && constraints.passive !== true) {
        var searchToggleBtn = document.createElement("button");
        searchToggleBtn.className = "qhf-search-toggle";
        if (localState.searchOpen || searchQuery) searchToggleBtn.classList.add("qhf-search-active");
        searchToggleBtn.innerHTML = "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='11' cy='11' r='7'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg>";
        searchToggleBtn.title = "Search";
        searchToggleBtn.addEventListener("click", function(ev) {
          ev.stopPropagation();
          localState.searchOpen = !localState.searchOpen;
          if (!localState.searchOpen) {
            // Close search: clear query
            localState.searchQuery = "";
            if (localState.searchTimer) clearTimeout(localState.searchTimer);
          }
          __qhfDoRender(element);
          // Focus the input after render if opening
          if (localState.searchOpen) {
            requestAnimationFrame(function() {
              // Query off element, not rootEl — rootEl is from the previous
              // render pass and was detached by the rebuild above
              var inp = element.querySelector(".qhf-search");
              if (inp) inp.focus();
            });
          }
        });
        hdr.appendChild(searchToggleBtn);
      }
      var hdrTitle = document.createElement("span");
      hdrTitle.className = "qhf-header-title";
      hdrTitle.textContent = displayHeader || "";
      hdr.appendChild(hdrTitle);
      rootEl.appendChild(hdr);

      // Search bar — toggled open/closed by the magnifying glass icon
      if (showSearch && constraints.passive !== true) {
        var searchWrap = document.createElement("div");
        searchWrap.className = "qhf-search-wrap";
        if (localState.searchOpen || searchQuery) searchWrap.classList.add("qhf-search-open");

        var searchInput = document.createElement("input");
        searchInput.className = "qhf-search";
        searchInput.type = "text";
        searchInput.placeholder = "Search in listbox";
        searchInput.value = searchQuery || "";

        searchInput.addEventListener("input", function(e) {
          var val = e.target.value;
          if (localState.searchTimer) clearTimeout(localState.searchTimer);
          var tid = setTimeout(function() {
            localState.searchQuery = val;
            __qhfDoRender(element);
          }, 200);
          localState.searchTimer = tid;
        });

        searchInput.addEventListener("keydown", function(e) {
          if (e.key === "Escape") {
            // Escape from search: clear search, close search box, blur
            e.preventDefault();
            e.stopPropagation();
            searchInput.value = "";
            localState.searchQuery = "";
            localState.searchOpen = false;
            if (localState.searchTimer) clearTimeout(localState.searchTimer);
            searchInput.blur();
            __qhfDoRender(element);
            return;
          }
          if (e.key === "Tab") {
            // Tab from search: focus first tree node
            e.preventDefault();
            e.stopPropagation();
            var firstNode = rootEl.querySelector(".qhf-node");
            if (firstNode) firstNode.focus();
            return;
          }
          e.stopPropagation();
        });

        searchWrap.appendChild(searchInput);
        rootEl.appendChild(searchWrap);

        // Restore focus + caret if the rebuild happened while the user was typing
        if (_searchWasFocused) {
          searchInput.focus();
          if (_searchSelStart !== null) {
            try { searchInput.setSelectionRange(_searchSelStart, _searchSelEnd); } catch (e) { /* ignore */ }
          }
        }
      }

      // Tree scroll container
      var scrollContainer = document.createElement("div");
      scrollContainer.className = "qhf-tree-scroll";
      rootEl.appendChild(scrollContainer);

      // Render options (using shared callbacks)
      var renderOpts = {
        expandState: expandState,
        expandLevel: expandLevel,
        indentPx: indentPx,
        iconStyle: iconStyle,
        showCount: showCount,
        searchQuery: searchQuery,
        stateTextColors: localState._stateTextColors,
        onToggle: onToggleFn,
        onSelect: onSelectFn,
        selections: selections,
        localState: localState,
        closePopup: closePopupIfOpen
      };

      // Render the tree
      renderTree(rootEl, displayRoots, renderOpts);
      localState._lastRenderedFP = layoutFP;

      // Restore scroll position from before the full rebuild
      if (savedInlineScroll > 0) scrollContainer.scrollTop = savedInlineScroll;
      // Restore keyboard focus to the same tree row, if it survived the rebuild
      restoreFocusedNode(scrollContainer, _focusedNodeId);

      // Bottom toolbar
      if (constraints.passive !== true) {
        var toolbar = document.createElement("div");
        toolbar.className = "qhf-toolbar";

        var expandAllBtn = document.createElement("button");
        expandAllBtn.className = "qhf-toolbar-btn qhf-toolbar-expand";
        expandAllBtn.textContent = "Expand All";
        expandAllBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          var allChildren = rootEl.querySelectorAll(".qhf-children");
          for (var ci = 0; ci < allChildren.length; ci++) {
            allChildren[ci].classList.remove("qhf-collapsed");
            allChildren[ci].style.maxHeight = "none";
          }
          var allToggles = rootEl.querySelectorAll(".qhf-toggle");
          for (var ti = 0; ti < allToggles.length; ti++) {
            if (!allToggles[ti].classList.contains("qhf-hidden")) {
              allToggles[ti].classList.add("qhf-expanded");
            }
          }
          function markAllExp(nodes) {
            for (var i = 0; i < nodes.length; i++) {
              if (nodes[i].children && nodes[i].children.length > 0) {
                localState.expandState[nodes[i].id] = true;
                markAllExp(nodes[i].children);
              }
            }
          }
          markAllExp(displayRoots);
        });

        var collapseAllBtn = document.createElement("button");
        collapseAllBtn.className = "qhf-toolbar-btn qhf-toolbar-expand";
        collapseAllBtn.textContent = "Collapse All";
        collapseAllBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          var allChildren = rootEl.querySelectorAll(".qhf-children");
          for (var ci = 0; ci < allChildren.length; ci++) {
            allChildren[ci].classList.add("qhf-collapsed");
            allChildren[ci].style.maxHeight = "0";
          }
          var allToggles = rootEl.querySelectorAll(".qhf-toggle");
          for (var ti = 0; ti < allToggles.length; ti++) {
            allToggles[ti].classList.remove("qhf-expanded");
          }
          function markAllCol(nodes) {
            for (var i = 0; i < nodes.length; i++) {
              if (nodes[i].children && nodes[i].children.length > 0) {
                localState.expandState[nodes[i].id] = false;
                markAllCol(nodes[i].children);
              }
            }
          }
          markAllCol(displayRoots);
        });

        toolbar.appendChild(expandAllBtn);
        toolbar.appendChild(collapseAllBtn);

        var spacer = document.createElement("div");
        spacer.className = "qhf-toolbar-spacer";
        toolbar.appendChild(spacer);

        var totalNodes = displayRoots.length;
        function countAll(nodes) { var c = 0; for (var i = 0; i < nodes.length; i++) { c += 1 + countAll(nodes[i].children); } return c; }
        var totalAll = countAll(displayRoots);
        var nodeCountLabel = document.createElement("span");
        nodeCountLabel.style.fontSize = "11px";
        nodeCountLabel.style.opacity = "0.5";
        nodeCountLabel.textContent = totalAll + " values";
        toolbar.appendChild(nodeCountLabel);

        rootEl.appendChild(toolbar);
      }

    } catch(renderErr) {
      element.innerHTML = '<div style="padding:16px;color:red;font-size:12px;">Render error: ' + renderErr.message + '</div>';
      console.error("qix-hierarchy-select render error:", renderErr);
    }
  }

  // ============================================================
  // Supernova Factory
  // ============================================================
  return function (env) {
    return {
      qae: {
        properties: {
          props: {
            mode: "multiDim",
            expandLevel: 1,
            showSearch: true,
            showCount: false,
            selectLeafOnly: false,
            singleSelect: "multi",
            selectWithChildren: false,
            iconStyle: "arrow",
            indentPx: 20,
            rowHeight: false,
            accentColor: { color: "#4477AA", index: -1 },
            headerText: ""
          },
          qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
            qInitialDataFetch: [{ qWidth: 6, qHeight: 1666 }],
            qSuppressZero: false,
            qSuppressMissing: true
          }
        },
        data: {
          targets: [{
            path: "/qHyperCubeDef",
            dimensions: {
              min: 0,
              max: function(nDims, properties) {
                return properties.props && properties.props.mode === "parentChild" ? 3 : 6;
              }
            },
            measures: { min: 0, max: 0 }
          }]
        }
      },

      ext: propertyPanel(),

      component: function () {
        var element = stardust.useElement();
        var layout = stardust.useLayout();
        var theme = stardust.useTheme();
        var constraints = stardust.useConstraints();

        var selections = null;
        try { selections = stardust.useSelections(); } catch(e) { /* ok */ }

        var model = null;
        try { model = stardust.useModel(); } catch(e) { /* ok */ }

        if (!element.__qhfState) {
          element.__qhfState = {
            expandState: {},
            searchQuery: "",
            searchOpen: false,
            popupSearchOpen: false,
            searchTimer: null,
            sessionDimNo: -1,
            prevExpandLevel: undefined,
            popupEl: null,
            popupOverlayEl: null
          };
        }
        var localState = element.__qhfState;

        element.__qhfRenderCtx = { layout: layout, theme: theme, model: model, element: element, selections: selections, localState: localState, constraints: constraints };

        // Watch for external selection cancellation (e.g. user clicked another object, or Escape)
        // Register event listeners directly (useEffect may not fire in some Nebula versions).
        // Track the registered selections object on localState to avoid duplicate listeners.
        if (selections && typeof selections.on === "function" && localState._boundSelections !== selections) {
          // Remove old listeners if selections object changed
          if (localState._boundSelections && typeof localState._boundSelections.removeListener === "function") {
            if (localState._onCanceled) localState._boundSelections.removeListener("canceled", localState._onCanceled);
            if (localState._onDeactivated) localState._boundSelections.removeListener("deactivated", localState._onDeactivated);
          }
          localState._onCanceled = function() {
            if (localState._crossDimTransition) return; // Skip during cross-dim transition
            var objId = (layout && layout.qInfo) ? layout.qInfo.qId : "default";
            localState.sessionDimNo = -1;
            localState._crossDimSelected = null; // Clear cross-dim hint when session ends
            __qhfSelectUpdating[objId] = false;
            localState._cancelledRender = true;
            __qhfDoRender(element);
          };
          localState._onDeactivated = function() { localState._onCanceled(); };
          selections.on("canceled", localState._onCanceled);
          selections.on("deactivated", localState._onDeactivated);
          localState._boundSelections = selections;
        }
        // Also keep useEffect as fallback for cleanup when component unmounts
        stardust.useEffect(function () {
          return function() {
            if (localState._boundSelections && typeof localState._boundSelections.removeListener === "function") {
              if (localState._onCanceled) localState._boundSelections.removeListener("canceled", localState._onCanceled);
              if (localState._onDeactivated) localState._boundSelections.removeListener("deactivated", localState._onDeactivated);
              localState._boundSelections = null;
            }
          };
        }, [selections]);

        stardust.useEffect(function () {
          __qhfDoRender(element);
        }, [layout, theme, constraints]);
        // Direct call — useEffect may not fire in some Nebula/Qlik Cloud versions
        __qhfDoRender(element);
      }
    };
  };
});
